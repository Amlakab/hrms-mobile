import os
import collections
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

def extract_emblem():
    source_path = 'assets/hrms-logo1.jpg'
    im = Image.open(source_path).convert('RGBA')
    
    # Emblem is centered inside x=[190, 1500], y=[145, 1455]
    square = im.crop((190, 145, 1500, 1455))
    arr = np.array(square)
    h, w, _ = arr.shape
    
    # BFS floodfill from 4 borders to remove outer white background
    visited = np.zeros((h, w), dtype=bool)
    q = collections.deque()
    for x in range(w):
        q.append((0, x))
        q.append((h - 1, x))
    for y in range(h):
        q.append((y, 0))
        q.append((y, w - 1))
        
    for y, x in q:
        visited[y, x] = True
        
    while q:
        y, x = q.popleft()
        for dy, dx in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
            ny, nx = y + dy, x + dx
            if 0 <= ny < h and 0 <= nx < w and not visited[ny, nx]:
                r, g, b, _ = arr[ny, nx]
                if r >= 238 and g >= 238 and b >= 238:
                    visited[ny, nx] = True
                    q.append((ny, nx))
                    
    # Set background alpha to 0
    arr[visited, 3] = 0
    
    emblem_transparent = Image.fromarray(arr)
    # Crop to non-transparent bbox
    bbox = emblem_transparent.getbbox()
    emblem_cropped = emblem_transparent.crop(bbox)
    
    # Also create a clean white-backed version of the cropped emblem
    # with antialiasing against white
    emblem_white = Image.new('RGBA', emblem_cropped.size, (255, 255, 255, 255))
    emblem_white.paste(emblem_cropped, (0, 0), emblem_cropped)
    
    return emblem_cropped, emblem_white

def make_centered_icon(emblem, canvas_size, scale_ratio, bg_color=None, round_mask=False):
    """
    scale_ratio: fraction of canvas_size that the larger dimension of emblem should occupy
    """
    canvas = Image.new('RGBA', (canvas_size, canvas_size), (0, 0, 0, 0) if bg_color is None else bg_color)
    
    target_dim = int(canvas_size * scale_ratio)
    ew, eh = emblem.size
    if ew >= eh:
        nw = target_dim
        nh = int(eh * (nw / ew))
    else:
        nh = target_dim
        nw = int(ew * (nh / eh))
        
    resized_emblem = emblem.resize((nw, nh), Image.Resampling.LANCZOS)
    offset_x = (canvas_size - nw) // 2
    offset_y = (canvas_size - nh) // 2
    
    canvas.paste(resized_emblem, (offset_x, offset_y), resized_emblem)
    
    if round_mask:
        # Create circular mask
        mask = Image.new('L', (canvas_size, canvas_size), 0)
        draw = ImageDraw.Draw(mask)
        draw.ellipse((0, 0, canvas_size, canvas_size), fill=255)
        # Apply mask
        canvas.putalpha(mask)
        
    return canvas

def make_monochrome_icon(foreground_img):
    # For Android themed icons: single color (white) with varying alpha based on foreground
    arr = np.array(foreground_img)
    alpha = arr[:, :, 3]
    # Invert/map luminosity to alpha or preserve alpha
    mono_arr = np.zeros_like(arr)
    mono_arr[:, :, 0] = 255
    mono_arr[:, :, 1] = 255
    mono_arr[:, :, 2] = 255
    mono_arr[:, :, 3] = alpha
    return Image.fromarray(mono_arr)

def main():
    print("Extracting emblem from assets/hrms-logo1.jpg...")
    emblem_trans, emblem_white = extract_emblem()
    print(f"Emblem extracted: size={emblem_trans.size}")
    
    # 1. Expo Assets:
    print("Generating Expo assets...")
    # icon.png: 1024x1024, white background, scale 0.72
    icon_1024 = make_centered_icon(emblem_white, 1024, 0.72, bg_color=(255, 255, 255, 255))
    icon_1024.convert('RGB').save('assets/icon.png', 'PNG', quality=95)
    
    # android-icon-foreground.png: 512x512, transparent, scale 0.65 (safe area)
    fg_512 = make_centered_icon(emblem_trans, 512, 0.65, bg_color=None)
    fg_512.save('assets/android-icon-foreground.png', 'PNG')
    
    # android-icon-background.png: 512x512, white
    bg_512 = Image.new('RGBA', (512, 512), (255, 255, 255, 255))
    bg_512.save('assets/android-icon-background.png', 'PNG')
    
    # android-icon-monochrome.png: 512x512
    mono_512 = make_monochrome_icon(fg_512)
    mono_512.save('assets/android-icon-monochrome.png', 'PNG')
    
    # splash-icon.png: 1024x1024, transparent, scale 0.45
    splash_1024 = make_centered_icon(emblem_trans, 1024, 0.45, bg_color=None)
    splash_1024.save('assets/splash-icon.png', 'PNG')
    
    # favicon.png: 48x48
    favicon_48 = make_centered_icon(emblem_white, 48, 0.85, bg_color=(255, 255, 255, 255))
    favicon_48.save('assets/favicon.png', 'PNG')
    
    # 2. Android Mipmap densities
    # mdpi: base=48, adaptive=108
    # hdpi: base=72, adaptive=162
    # xhdpi: base=96, adaptive=216
    # xxhdpi: base=144, adaptive=324
    # xxxhdpi: base=192, adaptive=432
    densities = {
        'mdpi': (48, 108),
        'hdpi': (72, 162),
        'xhdpi': (96, 216),
        'xxhdpi': (144, 324),
        'xxxhdpi': (192, 432),
    }
    
    print("Generating Android mipmap icons...")
    for dens, (base_sz, adapt_sz) in densities.items():
        res_dir = f'android/app/src/main/res/mipmap-{dens}'
        os.makedirs(res_dir, exist_ok=True)
        
        # ic_launcher.webp (legacy square/rounded on white)
        launcher = make_centered_icon(emblem_white, base_sz, 0.78, bg_color=(255, 255, 255, 255))
        launcher.save(f'{res_dir}/ic_launcher.webp', 'WEBP', quality=95)
        
        # ic_launcher_round.webp (circular icon on white)
        launcher_round = make_centered_icon(emblem_white, base_sz, 0.75, bg_color=(255, 255, 255, 255), round_mask=True)
        launcher_round.save(f'{res_dir}/ic_launcher_round.webp', 'WEBP', quality=95)
        
        # ic_launcher_foreground.webp (adaptive foreground, transparent, 65% safe area)
        fg = make_centered_icon(emblem_trans, adapt_sz, 0.65, bg_color=None)
        fg.save(f'{res_dir}/ic_launcher_foreground.webp', 'WEBP', quality=95)
        
        # ic_launcher_background.webp (adaptive background, pure white)
        bg = Image.new('RGBA', (adapt_sz, adapt_sz), (255, 255, 255, 255))
        bg.save(f'{res_dir}/ic_launcher_background.webp', 'WEBP', quality=95)
        
        # ic_launcher_monochrome.webp (monochrome)
        mono = make_monochrome_icon(fg)
        mono.save(f'{res_dir}/ic_launcher_monochrome.webp', 'WEBP', quality=95)
        
    # 3. Android Splashscreen drawables
    splash_sizes = {
        'mdpi': 288,
        'hdpi': 432,
        'xhdpi': 576,
        'xxhdpi': 864,
        'xxxhdpi': 1152,
    }
    print("Generating Android splashscreen drawables...")
    for dens, sz in splash_sizes.items():
        drawable_dir = f'android/app/src/main/res/drawable-{dens}'
        os.makedirs(drawable_dir, exist_ok=True)
        splash_logo = make_centered_icon(emblem_trans, sz, 0.55, bg_color=None)
        splash_logo.save(f'{drawable_dir}/splashscreen_logo.png', 'PNG')
        
    print("All launcher and splash icons successfully generated from assets/hrms-logo1.jpg!")

if __name__ == '__main__':
    main()
