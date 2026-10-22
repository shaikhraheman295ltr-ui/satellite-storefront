import os, re, json
from PIL import Image

root = r"C:\Users\HP\OneDrive\Pictures\Documents\sh ecomerc"

def scan(dirpath, name):
    files = sorted(os.listdir(dirpath))
    jpgs = [f for f in files if f.lower().endswith((".jpg", ".jpeg", ".png", ".webp"))]
    # extract numeric suffix if any
    nums = []
    pat = None
    for f in jpgs:
        m = re.search(r"(\d+)\.(jpe?g|png|webp)$", f, re.I)
        if m:
            nums.append(int(m.group(1)))
            base = f[: f.rfind(str(m.group(1)))]
            ext = m.group(2)
            pat = base[:-0 if False else None] if base is None else base
    nums.sort()
    gaps = []
    if nums:
        expected = set(range(nums[0], nums[-1] + 1))
        gaps = sorted(expected - set(nums))
    # dimensions: sample first, middle, last
    dims = []
    for idx in (0, len(jpgs)//2, len(jpgs)-1):
        with Image.open(os.path.join(dirpath, jpgs[idx])) as im:
            dims.append((jpgs[idx], im.size, im.format, os.path.getsize(os.path.join(dirpath, jpgs[idx]))))
    total = sum(os.path.getsize(os.path.join(dirpath, f)) for f in files)
    print(json.dumps({
        "folder": name,
        "count": len(jpgs),
        "first": jpgs[0], "last": jpgs[-1],
        "num_first": nums[0], "num_last": nums[-1],
        "gaps": gaps,
        "supported_files": len(jpgs), "other_files": [f for f in files if f not in jpgs],
        "total_bytes": total,
        "samples": dims,
    }))

for d in ["2.1", "2.2", "2.3", "v1"]:
    scan(os.path.join(root, "frames", d), d)
scan(os.path.join(root, "images"), "images")
