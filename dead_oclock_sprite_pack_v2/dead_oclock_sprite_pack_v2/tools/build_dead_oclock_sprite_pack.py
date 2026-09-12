#!/usr/bin/env python3
"""Build a transparent, normalized DEAD O'CLOCK sprite pack from source sheets."""

from __future__ import annotations

import argparse
from collections import deque
import json
import shutil
from pathlib import Path
from statistics import median

import numpy as np
from PIL import Image, ImageDraw, ImageFont
from scipy import ndimage


ENEMIES = [
    "zombie_man",
    "pumpkin_king",
    "ghost",
    "zombie_woman",
    "pumpkin_mage",
    "werewolf",
    "bloated_zombie",
    "scarecrow_reaper",
    "headless_knight",
    "crawler_zombie",
    "witch",
    "giant_spider",
    "skeleton_gunner",
    "gargoyle",
    "clock_reaper",
]

MOVEMENT_ROWS = [
    ["zombie_man", "pumpkin_king", "ghost"],
    ["zombie_woman", "pumpkin_mage", "werewolf"],
    ["bloated_zombie", "scarecrow_reaper", "headless_knight"],
    ["crawler_zombie", "witch", "giant_spider"],
    ["skeleton_gunner", "gargoyle", "clock_reaper"],
]

ATTACK_DEATH_ROWS = [
    ["zombie_man", "zombie_woman", "bloated_zombie", "crawler_zombie", "skeleton_gunner"],
    ["pumpkin_king", "pumpkin_mage", "scarecrow_reaper", "witch", "gargoyle"],
    ["ghost", "werewolf", "headless_knight", "giant_spider", "clock_reaper"],
]

PROJECTILE_ROWS = [
    ["bullet", "acid_orb", "pumpkin_fireball", "void_lightning"],
    ["infernal_portal", "spinning_scythe", "acid_bolt", "stone_shard"],
    ["ghost_skull", "blood_slash", "void_orb", "time_moon"],
]

FACE_NAMES = [
    "01_idle",
    "02_glance_left",
    "03_glance_right",
    "04_alert",
    "05_attack",
    "06_damage_left",
    "07_damage_right",
    "08_wounded",
    "09_critical",
    "10_halloween_powerup",
    "11_victory",
    "12_dead",
]

SOURCES = {
    "movement": "exec-5cfe1064-1875-4691-b268-a7f691b363b5.png",
    "attack": "exec-60bf2337-ff04-4851-9aa7-53aedb3ff396.png",
    "death": "exec-df83fb57-bcb1-4591-a4a3-c5a1c47c060a.png",
    "projectiles": "exec-f0f987ea-db2f-4f90-bcf8-18995208862d.png",
    "faces": "exec-a56ccfa3-38e4-49a0-9f7e-7c43452f6acf.png",
    "hud": "exec-802e4095-0f0d-492c-b559-c47ea4486b9f.png",
}

ROW_RANGES = {
    "movement": [(60, 205), (240, 380), (410, 566), (602, 745), (775, 936)],
    "attack": [(40, 288), (329, 645), (689, 961)],
    "death": [(92, 314), (382, 629), (696, 906)],
    "projectiles": [(103, 264), (405, 567), (720, 861)],
}


def transparentize(image: Image.Image, *, border_only: bool = False) -> Image.Image:
    """Remove the saturated green screen while preserving non-key green artwork."""
    rgb = np.asarray(image.convert("RGB"), dtype=np.float32)
    r, g, b = rgb[:, :, 0], rgb[:, :, 1], rgb[:, :, 2]
    border = np.concatenate([rgb[0], rgb[-1], rgb[:, 0], rgb[:, -1]], axis=0)
    ref = np.median(border, axis=0)
    distance = np.sqrt(np.sum((rgb - ref) ** 2, axis=2))

    candidate = (
        (g > 130)
        & (r < 85)
        & (b < 105)
        & ((g - r) > 85)
        & ((g - b) > 70)
        & (distance < 95)
    )

    labels, count = ndimage.label(candidate, structure=np.ones((3, 3), dtype=np.uint8))
    border_labels = np.unique(
        np.concatenate([labels[0], labels[-1], labels[:, 0], labels[:, -1]])
    )
    background = np.isin(labels, border_labels[border_labels != 0])

    if not border_only and count:
        areas = np.bincount(labels.ravel())
        near_ref = distance < 58
        for label_id in range(1, count + 1):
            if areas[label_id] >= 48:
                component = labels == label_id
                if np.mean(near_ref[component]) > 0.88:
                    background |= component

    alpha = np.where(background, 0, 255).astype(np.uint8)
    rgba = np.dstack([rgb.astype(np.uint8), alpha])
    return Image.fromarray(rgba, mode="RGBA")


def tight_crop(image: Image.Image, padding: int = 4) -> Image.Image:
    arr = np.asarray(image)
    ys, xs = np.nonzero(arr[:, :, 3] > 0)
    if len(xs) == 0:
        raise ValueError("Empty sprite after chroma-key removal")
    x0 = max(0, int(xs.min()) - padding)
    y0 = max(0, int(ys.min()) - padding)
    x1 = min(image.width, int(xs.max()) + 1 + padding)
    y1 = min(image.height, int(ys.max()) + 1 + padding)
    return image.crop((x0, y0, x1, y1))


def component_boxes(mask: np.ndarray, y0: int, y1: int, min_area: int) -> list[tuple[int, int, int, int]]:
    labels, _ = ndimage.label(mask[y0:y1], structure=np.ones((3, 3), dtype=np.uint8))
    areas = np.bincount(labels.ravel())
    objects = ndimage.find_objects(labels)
    boxes: list[tuple[int, int, int, int]] = []
    for label_id, slices in enumerate(objects, start=1):
        if slices is None or areas[label_id] < min_area:
            continue
        yy, xx = slices
        boxes.append((xx.start, yy.start + y0, xx.stop, yy.stop + y0))
    boxes.sort(key=lambda box: (box[0] + box[2]) / 2)
    return boxes


def split_widest_boxes(
    boxes: list[tuple[int, int, int, int]],
    mask: np.ndarray,
    y0: int,
    y1: int,
    expected: int,
) -> list[tuple[int, int, int, int]]:
    boxes = list(boxes)
    while len(boxes) < expected:
        widths = [box[2] - box[0] for box in boxes]
        index = int(np.argmax(widths))
        x0, by0, x1, by1 = boxes.pop(index)
        projection = mask[y0:y1, x0:x1].sum(axis=0)
        lo = max(1, int(len(projection) * 0.30))
        hi = min(len(projection) - 1, int(len(projection) * 0.70))
        if hi <= lo:
            raise ValueError("Unable to split a merged sprite component")
        cut = x0 + lo + int(np.argmin(projection[lo:hi]))
        for sx0, sx1 in ((x0, cut), (cut, x1)):
            sub = mask[y0:y1, sx0:sx1]
            ys, xs = np.nonzero(sub)
            if len(xs) == 0:
                raise ValueError("Split produced an empty sprite component")
            boxes.append((sx0 + int(xs.min()), y0 + int(ys.min()), sx0 + int(xs.max()) + 1, y0 + int(ys.max()) + 1))
        boxes.sort(key=lambda box: (box[0] + box[2]) / 2)
    if len(boxes) != expected:
        raise ValueError(f"Expected {expected} sprite components, found {len(boxes)}")
    return boxes


def crops_from_boxes(
    rgba: Image.Image,
    boxes: list[tuple[int, int, int, int]],
    y0: int,
    y1: int,
) -> list[Image.Image]:
    centers = [(box[0] + box[2]) / 2 for box in boxes]
    boundaries = [0]
    boundaries.extend(int(round((centers[i] + centers[i + 1]) / 2)) for i in range(len(centers) - 1))
    boundaries.append(rgba.width)
    sprites: list[Image.Image] = []
    for index in range(len(boxes)):
        cell = rgba.crop((boundaries[index], y0, boundaries[index + 1], y1))
        cell = transparentize(cell, border_only=True)
        sprites.append(tight_crop(cell, padding=4))
    return sprites


def isolated_component_sprites(
    rgba: Image.Image,
    y0: int,
    y1: int,
    min_area: int,
) -> list[Image.Image]:
    """Extract whole connected sprites and attach nearby particles to the nearest one."""
    source = np.asarray(rgba)
    mask = source[y0:y1, :, 3] > 0
    labels, _ = ndimage.label(mask, structure=np.ones((3, 3), dtype=np.uint8))
    areas = np.bincount(labels.ravel())
    objects = ndimage.find_objects(labels)

    large: list[dict[str, object]] = []
    small: list[dict[str, object]] = []
    for label_id, slices in enumerate(objects, start=1):
        if slices is None:
            continue
        yy, xx = slices
        record = {
            "label": label_id,
            "area": int(areas[label_id]),
            "center": ((xx.start + xx.stop) / 2, (yy.start + yy.stop) / 2),
            "bbox": (xx.start, yy.start, xx.stop, yy.stop),
        }
        if areas[label_id] >= min_area:
            large.append(record)
        elif areas[label_id] >= 3:
            small.append(record)

    large.sort(key=lambda record: record["center"][0])
    owned: list[set[int]] = [{int(record["label"])} for record in large]
    for particle in small:
        px, py = particle["center"]
        distances = []
        for record in large:
            cx, cy = record["center"]
            distances.append((px - cx) ** 2 + (py - cy) ** 2)
        nearest = int(np.argmin(distances))
        if distances[nearest] <= 125**2:
            owned[nearest].add(int(particle["label"]))

    sprites: list[Image.Image] = []
    for label_ids in owned:
        keep = np.isin(labels, list(label_ids))
        isolated = source[y0:y1].copy()
        isolated[:, :, 3] = np.where(keep, isolated[:, :, 3], 0)
        sprites.append(tight_crop(Image.fromarray(isolated, mode="RGBA"), padding=4))
    return sprites


def split_touching_pair(image: Image.Image) -> tuple[Image.Image, Image.Image]:
    """Separate two touching, side-by-side sprites using seeded geodesic growth."""
    source = np.asarray(image).copy()
    foreground = source[:, :, 3] > 0
    ys, xs = np.nonzero(foreground)
    x0, x1 = int(xs.min()), int(xs.max()) + 1
    y0, y1 = int(ys.min()), int(ys.max()) + 1
    width, height = x1 - x0, y1 - y0

    owner = np.full(foreground.shape, -1, dtype=np.int8)
    distance = np.full(foreground.shape, np.iinfo(np.int32).max, dtype=np.int32)
    queue: deque[tuple[int, int]] = deque()

    seed_boxes = [
        (x0 + int(width * 0.08), x0 + int(width * 0.38)),
        (x0 + int(width * 0.62), x0 + int(width * 0.92)),
    ]
    sy0, sy1 = y0 + int(height * 0.28), y0 + int(height * 0.92)
    for side, (sx0, sx1) in enumerate(seed_boxes):
        seed = foreground[sy0:sy1, sx0:sx1]
        seed_y, seed_x = np.nonzero(seed)
        for yy, xx in zip(seed_y + sy0, seed_x + sx0):
            owner[yy, xx] = side
            distance[yy, xx] = 0
            queue.append((int(yy), int(xx)))

    if not queue:
        raise ValueError("Unable to seed touching-sprite separation")

    neighbors = [(-1, -1), (-1, 0), (-1, 1), (0, -1), (0, 1), (1, -1), (1, 0), (1, 1)]
    while queue:
        y, x = queue.popleft()
        next_distance = distance[y, x] + 1
        for dy, dx in neighbors:
            ny, nx = y + dy, x + dx
            if not (0 <= ny < foreground.shape[0] and 0 <= nx < foreground.shape[1]):
                continue
            if not foreground[ny, nx] or distance[ny, nx] <= next_distance:
                continue
            owner[ny, nx] = owner[y, x]
            distance[ny, nx] = next_distance
            queue.append((ny, nx))

    outputs: list[Image.Image] = []
    for side in (0, 1):
        isolated = source.copy()
        isolated[:, :, 3] = np.where(owner == side, isolated[:, :, 3], 0)
        outputs.append(tight_crop(Image.fromarray(isolated, mode="RGBA"), padding=4))
    return outputs[0], outputs[1]


def extract_rows(
    rgba: Image.Image,
    ranges: list[tuple[int, int]],
    expected_per_row: int,
    min_area: int,
    split_merged: bool = False,
) -> list[list[Image.Image]]:
    rows: list[list[Image.Image]] = []
    for y0, y1 in ranges:
        sprites = isolated_component_sprites(rgba, y0, y1, min_area)
        if split_merged and len(sprites) < expected_per_row:
            while len(sprites) < expected_per_row:
                widest_index = int(np.argmax([sprite.width for sprite in sprites]))
                left, right = split_touching_pair(sprites[widest_index])
                sprites[widest_index : widest_index + 1] = [left, right]
        if len(sprites) != expected_per_row:
            raise ValueError(f"Expected {expected_per_row} sprites in row {y0}:{y1}, found {len(sprites)}")
        rows.append(sprites)
    return rows


def normalize_sprite(image: Image.Image, canvas: tuple[int, int], scale: int = 1, bottom: int = 10) -> Image.Image:
    image = tight_crop(image, padding=0)
    if scale > 1:
        image = image.resize((image.width * scale, image.height * scale), Image.Resampling.NEAREST)
    max_w, max_h = canvas[0] - 16, canvas[1] - 16
    if image.width > max_w or image.height > max_h:
        ratio = min(max_w / image.width, max_h / image.height)
        image = image.resize(
            (max(1, int(round(image.width * ratio))), max(1, int(round(image.height * ratio)))),
            Image.Resampling.NEAREST,
        )
    result = Image.new("RGBA", canvas, (0, 0, 0, 0))
    x = (canvas[0] - image.width) // 2
    y = canvas[1] - bottom - image.height
    result.alpha_composite(image, (x, y))
    return result


def save_png(image: Image.Image, path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    image.save(path, format="PNG", optimize=True)


def checkerboard(size: tuple[int, int], square: int = 16) -> Image.Image:
    image = Image.new("RGB", size, "#d0d0d0")
    draw = ImageDraw.Draw(image)
    for y in range(0, size[1], square):
        for x in range(0, size[0], square):
            if (x // square + y // square) % 2:
                draw.rectangle((x, y, x + square - 1, y + square - 1), fill="#eeeeee")
    return image


def load_font(size: int) -> ImageFont.ImageFont:
    for candidate in (
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        "/usr/share/fonts/truetype/liberation2/LiberationSans-Bold.ttf",
    ):
        if Path(candidate).exists():
            return ImageFont.truetype(candidate, size)
    return ImageFont.load_default()


def build_preview(output: Path, attack_paths: dict[str, Path], face_paths: list[Path], projectile_paths: list[Path]) -> Path:
    width, height = 1800, 1500
    preview = Image.new("RGB", (width, height), "#17131f")
    draw = ImageDraw.Draw(preview)
    title_font = load_font(52)
    label_font = load_font(22)
    small_font = load_font(18)
    draw.text((55, 36), "DEAD O'CLOCK — TRANSPARENT SPRITE PACK", fill="#f39a24", font=title_font)

    cell_w, cell_h = 330, 340
    start_x, start_y = 55, 115
    for index, enemy in enumerate(ENEMIES):
        row, col = divmod(index, 5)
        x = start_x + col * cell_w
        y = start_y + row * cell_h
        tile = checkerboard((300, 280), 18)
        sprite = Image.open(attack_paths[enemy]).convert("RGBA")
        sprite.thumbnail((260, 250), Image.Resampling.NEAREST)
        tile_rgba = tile.convert("RGBA")
        tile_rgba.alpha_composite(sprite, ((300 - sprite.width) // 2, 270 - sprite.height))
        preview.paste(tile_rgba.convert("RGB"), (x, y))
        label = enemy.replace("_", " ").upper()
        draw.text((x, y + 286), label, fill="white", font=label_font)

    strip_y = 1160
    draw.text((55, strip_y - 48), "HUD FACE STATES", fill="#f39a24", font=label_font)
    for index, path in enumerate(face_paths[:6]):
        x = 55 + index * 160
        tile = checkerboard((140, 140), 10).convert("RGBA")
        sprite = Image.open(path).convert("RGBA")
        sprite.thumbnail((130, 130), Image.Resampling.NEAREST)
        tile.alpha_composite(sprite, ((140 - sprite.width) // 2, 138 - sprite.height))
        preview.paste(tile.convert("RGB"), (x, strip_y))

    draw.text((1050, strip_y - 48), "PROJECTILES", fill="#f39a24", font=label_font)
    for index, path in enumerate(projectile_paths[:6]):
        x = 1050 + index * 115
        tile = checkerboard((100, 100), 10).convert("RGBA")
        sprite = Image.open(path).convert("RGBA")
        sprite.thumbnail((92, 92), Image.Resampling.NEAREST)
        tile.alpha_composite(sprite, ((100 - sprite.width) // 2, (100 - sprite.height) // 2))
        preview.paste(tile.convert("RGB"), (x, strip_y + 20))

    draw.text((55, 1420), "169 gameplay-ready PNG assets • transparent alpha • normalized canvases", fill="#c8bfd6", font=small_font)
    preview_path = output.parent / "dead_oclock_sprite_pack_preview.png"
    preview.save(preview_path, format="PNG", optimize=True)
    return preview_path


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--source-dir", type=Path, required=True)
    parser.add_argument("--output-dir", type=Path, required=True)
    args = parser.parse_args()

    source_dir = args.source_dir.resolve()
    output = args.output_dir.resolve()
    if output.exists():
        raise SystemExit(f"Output already exists: {output}")
    output.mkdir(parents=True)

    source_rgba: dict[str, Image.Image] = {}
    for role, filename in SOURCES.items():
        source_path = source_dir / filename
        if not source_path.is_file():
            raise FileNotFoundError(source_path)
        original_dest = output / "source_sheets" / "original" / f"{role}.png"
        original_dest.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(source_path, original_dest)
        keyed = transparentize(Image.open(source_path), border_only=(role == "hud"))
        source_rgba[role] = keyed
        save_png(keyed, output / "source_sheets" / "transparent" / f"{role}_transparent.png")

    movement_rows: list[list[Image.Image]] = []
    for row_index, (y0, y1) in enumerate(ROW_RANGES["movement"]):
        row = isolated_component_sprites(source_rgba["movement"], y0, y1, min_area=500)
        if row_index in (0, 1, 2) and len(row) != 15:
            raise ValueError(f"Expected 15 movement sprites in row {row_index}, found {len(row)}")
        if row_index == 3 and len(row) != 14:
            raise ValueError(f"Expected 14 source sprites in spider row, found {len(row)}")
        if row_index == 4:
            if len(row) != 14:
                raise ValueError(f"Expected 14 source sprites in clock row, found {len(row)}")
            # The two central clock-reaper poses touch in the generated source sheet.
            left, right = split_touching_pair(row[11])
            row[11:12] = [left, right]
        movement_rows.append(row)
    attack_rows = extract_rows(
        source_rgba["attack"], ROW_RANGES["attack"], expected_per_row=5, min_area=500
    )
    death_rows = extract_rows(
        source_rgba["death"], ROW_RANGES["death"], expected_per_row=10, min_area=500
    )
    projectile_rows = extract_rows(
        source_rgba["projectiles"], ROW_RANGES["projectiles"], expected_per_row=12, min_area=800
    )

    movement_raw: dict[str, list[Image.Image]] = {}
    for row_index, names in enumerate(MOVEMENT_ROWS):
        row = movement_rows[row_index]
        for group_index, enemy in enumerate(names):
            if enemy == "giant_spider":
                original = row[group_index * 5 : group_index * 5 + 4]
                # The source contains four clean spider poses; add a subtle bob of
                # the first pose as the second forward-movement frame.
                movement_raw[enemy] = [original[0], original[0].copy(), original[1], original[2], original[3]]
            else:
                movement_raw[enemy] = row[group_index * 5 : group_index * 5 + 5]

    attack_raw: dict[str, Image.Image] = {}
    death_raw: dict[str, list[Image.Image]] = {}
    for row_index, names in enumerate(ATTACK_DEATH_ROWS):
        for col_index, enemy in enumerate(names):
            attack_raw[enemy] = attack_rows[row_index][col_index]
            death_raw[enemy] = death_rows[row_index][col_index * 2 : col_index * 2 + 2]

    attack_paths: dict[str, Path] = {}
    generated_files: list[str] = []
    for enemy in ENEMIES:
        attack_height = attack_raw[enemy].height
        move_height = median(frame.height for frame in movement_raw[enemy])
        death_reference_height = death_raw[enemy][0].height
        movement_scale = max(1, min(3, int(round(attack_height / move_height))))
        death_scale = max(1, min(2, int(round(attack_height / death_reference_height))))

        for index, frame in enumerate(movement_raw[enemy], start=1):
            path = output / "enemies" / enemy / "movement" / f"frame_{index:02d}.png"
            normalized = normalize_sprite(frame, (384, 384), movement_scale)
            if enemy == "giant_spider" and index == 2:
                bob = Image.new("RGBA", normalized.size, (0, 0, 0, 0))
                bob.alpha_composite(normalized, (0, 4))
                normalized = bob
            save_png(normalized, path)
            generated_files.append(str(path.relative_to(output)))

        attack_path = output / "enemies" / enemy / "attack" / "front_attack.png"
        save_png(normalize_sprite(attack_raw[enemy], (384, 384), 1), attack_path)
        attack_paths[enemy] = attack_path
        generated_files.append(str(attack_path.relative_to(output)))

        for index, frame in enumerate(death_raw[enemy], start=1):
            path = output / "enemies" / enemy / "death" / f"death_{index:02d}.png"
            save_png(normalize_sprite(frame, (384, 384), death_scale), path)
            generated_files.append(str(path.relative_to(output)))

    projectile_paths: list[Path] = []
    for row_index, names in enumerate(PROJECTILE_ROWS):
        row = projectile_rows[row_index]
        for group_index, projectile in enumerate(names):
            for frame_index, frame in enumerate(row[group_index * 3 : group_index * 3 + 3], start=1):
                path = output / "projectiles" / projectile / f"frame_{frame_index:02d}.png"
                save_png(normalize_sprite(frame, (192, 192), 1, bottom=8), path)
                projectile_paths.append(path)
                generated_files.append(str(path.relative_to(output)))

    face_paths: list[Path] = []
    face_sheet = source_rgba["faces"]
    cell_w, cell_h = face_sheet.width / 4, face_sheet.height / 3
    for index, name in enumerate(FACE_NAMES):
        row, col = divmod(index, 4)
        x0, x1 = round(col * cell_w), round((col + 1) * cell_w)
        y0, y1 = round(row * cell_h), round((row + 1) * cell_h)
        frame = tight_crop(transparentize(face_sheet.crop((x0, y0, x1, y1)), border_only=True), padding=4)
        path = output / "player" / "face" / f"{name}.png"
        save_png(normalize_sprite(frame, (384, 384), 1, bottom=0), path)
        face_paths.append(path)
        generated_files.append(str(path.relative_to(output)))

    hud_path = output / "ui" / "hud_halloween_transparent.png"
    save_png(source_rgba["hud"], hud_path)
    generated_files.append(str(hud_path.relative_to(output)))

    manifest = {
        "title": "DEAD O'CLOCK Sprite Pack",
        "version": 1,
        "format": "RGBA PNG",
        "canvas_sizes": {
            "enemy_frames": [384, 384],
            "projectile_frames": [192, 192],
            "face_frames": [384, 384],
            "hud": [source_rgba["hud"].width, source_rgba["hud"].height],
        },
        "counts": {
            "enemies": 15,
            "movement_frames": 75,
            "front_attacks": 15,
            "death_frames": 30,
            "projectile_frames": 36,
            "face_frames": 12,
            "hud": 1,
            "gameplay_png_total": 169,
        },
        "enemy_names": ENEMIES,
        "projectile_names": [name for row in PROJECTILE_ROWS for name in row],
        "face_states": FACE_NAMES,
        "files": generated_files,
    }
    (output / "manifest.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")

    readme = """DEAD O'CLOCK — SPRITE PACK V1

Contenuto
---------
- 15 nemici.
- 5 frame di movimento per nemico.
- 1 attacco frontale per nemico.
- 2 frame di morte per nemico.
- 12 famiglie di proiettili/magie, 3 frame ciascuna.
- 12 espressioni del protagonista.
- HUD Halloween completo con trasparenza.

Specifiche
----------
- Formato: PNG RGBA con vera trasparenza.
- Nemici: canvas uniforme 384×384 px, allineamento in basso al centro.
- Proiettili: canvas uniforme 192×192 px.
- Volti HUD: canvas uniforme 384×384 px.
- HUD: dimensione originale, area di gioco resa trasparente.
- Ridimensionamenti degli sprite effettuati con nearest-neighbor.

Struttura
---------
enemies/<nome>/movement/frame_01..05.png
enemies/<nome>/attack/front_attack.png
enemies/<nome>/death/death_01..02.png
projectiles/<nome>/frame_01..03.png
player/face/<stato>.png
ui/hud_halloween_transparent.png
source_sheets/original/ — tavole originali
source_sheets/transparent/ — tavole intere senza chroma key

Nota
----
Il verde presente all'interno di magie, fantasmi o dettagli dei mostri è parte
dell'illustrazione ed è stato preservato quando distinto dallo sfondo chroma.
"""
    (output / "README.txt").write_text(readme, encoding="utf-8")

    tools_dir = output / "tools"
    tools_dir.mkdir(parents=True, exist_ok=True)
    shutil.copy2(Path(__file__).resolve(), tools_dir / Path(__file__).name)

    preview_path = build_preview(output, attack_paths, face_paths, projectile_paths)

    # Final validation.
    pngs = [output / relative for relative in generated_files]
    if len(pngs) != 169:
        raise ValueError(f"Expected 169 gameplay PNG files, found {len(pngs)}")
    for path in pngs:
        image = Image.open(path)
        if image.mode != "RGBA":
            raise ValueError(f"Non-RGBA output: {path}")
        alpha = np.asarray(image)[:, :, 3]
        if alpha.max() == 0:
            raise ValueError(f"Empty output: {path}")
        if alpha.min() != 0:
            raise ValueError(f"Output has no transparent pixels: {path}")

    print(json.dumps({
        "output": str(output),
        "preview": str(preview_path),
        "gameplay_pngs": len(pngs),
        "enemy_canvas": "384x384",
        "projectile_canvas": "192x192",
        "face_canvas": "384x384",
    }, indent=2))


if __name__ == "__main__":
    main()
