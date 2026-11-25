"""Gera as imagens de vitrine dos produtos a partir dos arquivos reais em deliverables/.

Cada imagem (1600x1200, public/images/products/{slug}.jpg) mostra páginas de verdade do
produto — capa do e-book, abas das planilhas, páginas dos documentos e slides — sobre o
fundo escuro da marca. Rode de novo sempre que um arquivo de deliverables/ mudar.

Requisitos: LibreOffice (soffice), poppler (pdftoppm) e Pillow.
Uso: python3 scripts/generate-product-images.py
"""

import subprocess
import sys
import tempfile
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "deliverables"
OUT = ROOT / "public" / "images" / "products"
W, H = 1600, 1200

# (arquivo, página) de cada "folha" que aparece na imagem. A primeira da lista fica na
# frente; as demais vão atrás, em leque. Planilhas e slides são recortados nas margens.
PRODUCTS = {
    "ebook-gestao-financeira-na-pratica": [
        ("gestao-financeira-na-pratica.pdf", 1),
        ("gestao-financeira-na-pratica.pdf", 5),
        ("gestao-financeira-na-pratica.pdf", 7),
    ],
    "checklist-abertura-de-empresa": [
        ("checklist-abertura-de-empresa.pdf", 1),
        ("checklist-abertura-de-empresa.pdf", 2),
        ("checklist-abertura-de-empresa.pdf", 3),
    ],
    "plano-de-negocios-enxuto": [
        ("plano-de-negocios-enxuto.pdf", 1),
        ("plano-de-negocios-enxuto.pdf", 2),
        ("plano-de-negocios-enxuto.pdf", 3),
    ],
    "modelo-de-business-plan": [
        ("modelo-de-business-plan.docx", 1),
        ("apresentacao-executiva.pptx", 1),
        ("apresentacao-executiva.pptx", 11),
    ],
    "modelo-de-planejamento-estrategico": [
        ("modelo-de-planejamento-estrategico.docx", 1),
        ("apresentacao-de-alinhamento.pptx", 1),
        ("apresentacao-de-alinhamento.pptx", 4),
    ],
    "planilha-dre-gerencial": [
        ("planilha-dre-gerencial.xlsx", 1),
        ("planilha-dre-gerencial.xlsx", 3),
        ("planilha-dre-gerencial.xlsx", 10),
    ],
    "planilha-fluxo-de-caixa-empresarial": [
        ("planilha-fluxo-de-caixa-empresarial-manual.pdf", 1),
        ("planilha-fluxo-de-caixa-empresarial.xlsx", 8),
        ("planilha-fluxo-de-caixa-empresarial.xlsx", 11),
    ],
    "planilha-de-precificacao": [
        ("planilha-de-precificacao.xlsx", 1),
        ("planilha-de-precificacao.xlsx", 4),
        ("planilha-de-precificacao.xlsx", 6),
    ],
    "planilha-orcamento-empresarial": [
        ("planilha-orcamento-empresarial.xlsx", 1),
        ("planilha-orcamento-empresarial.xlsx", 3),
        ("planilha-orcamento-empresarial.xlsx", 5),
    ],
    "dashboard-financeiro-gerencial": [
        ("dashboard-financeiro-gerencial.xlsx", 1),
        ("dashboard-financeiro-gerencial.xlsx", 5),
        ("dashboard-financeiro-gerencial.xlsx", 6),
    ],
    "kit-financeiro-empresarial": [
        ("manual-de-implantacao-kit-financeiro-empresarial.pdf", 1),
        ("planilha-fluxo-de-caixa-empresarial-manual.pdf", 1),
        ("dashboard-financeiro-gerencial.xlsx", 1),
        ("planilha-dre-gerencial.xlsx", 1),
        ("planilha-de-precificacao.xlsx", 1),
    ],
    "kit-gestao-empresarial": [
        ("rotina-de-reunioes-de-gestao.pdf", 1),
        ("modelo-de-planejamento-estrategico.docx", 1),
        ("plano-de-negocios-enxuto.pdf", 1),
        ("planilha-dre-gerencial.xlsx", 1),
    ],
}

BG_TOP, BG_BOTTOM = (26, 26, 26), (14, 14, 14)
GOLD = (201, 178, 133)


def to_pdf(src: Path, tmp: Path) -> Path:
    if src.suffix == ".pdf":
        return src
    out = tmp / (src.stem + "-" + src.suffix[1:] + ".pdf")
    if not out.exists():
        conv = tmp / "conv"
        conv.mkdir(exist_ok=True)
        subprocess.run(
            ["soffice", "--headless", "--convert-to", "pdf", "--outdir", str(conv), str(src)],
            check=True,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )
        (conv / (src.stem + ".pdf")).rename(out)
    return out


def render_page(pdf: Path, page: int, tmp: Path, crop: bool) -> Image.Image:
    prefix = tmp / f"{pdf.stem}-p{page}"
    png = Path(str(prefix) + ".png")
    if not png.exists():
        subprocess.run(
            ["pdftoppm", "-r", "150", "-png", "-singlefile", "-f", str(page), "-l", str(page),
             str(pdf), str(prefix)],
            check=True,
        )
    img = Image.open(png).convert("RGB")
    if crop:
        # Planilhas e slides saem com muita margem branca: recorta no conteúdo.
        diff = ImageChops.difference(img, Image.new("RGB", img.size, (255, 255, 255)))
        box = diff.convert("L").point(lambda v: 255 if v > 12 else 0).getbbox()
        if box:
            pad = 24
            img = img.crop((max(box[0] - pad, 0), max(box[1] - pad, 0),
                            min(box[2] + pad, img.width), min(box[3] + pad, img.height)))
    return img


def sheet(img: Image.Image, max_w: int, max_h: int) -> Image.Image:
    img = img.copy()
    img.thumbnail((max_w, max_h), Image.LANCZOS)
    return img


def paste_with_shadow(canvas: Image.Image, img: Image.Image, x: int, y: int, angle: float = 0):
    border = 1
    framed = Image.new("RGB", (img.width + 2 * border, img.height + 2 * border), (60, 60, 60))
    framed.paste(img, (border, border))
    rgba = framed.convert("RGBA")
    if angle:
        rgba = rgba.rotate(angle, resample=Image.BICUBIC, expand=True)
    shadow = Image.new("RGBA", (rgba.width + 120, rgba.height + 120), (0, 0, 0, 0))
    mask = rgba.split()[3]
    shadow.paste((0, 0, 0, 190), (60, 75), mask)
    shadow = shadow.filter(ImageFilter.GaussianBlur(28))
    x, y = int(x), int(y)
    for layer_img, pos in ((shadow, (x - 60, y - 60)), (rgba, (x, y))):
        # paste() clips at the canvas edges (alpha_composite() rejects out-of-bounds offsets).
        layer = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
        layer.paste(layer_img, pos)
        canvas.alpha_composite(layer)


def background() -> Image.Image:
    bg = Image.new("RGBA", (W, H))
    draw = ImageDraw.Draw(bg)
    for row in range(H):
        t = row / H
        color = tuple(int(BG_TOP[i] + (BG_BOTTOM[i] - BG_TOP[i]) * t) for i in range(3))
        draw.line([(0, row), (W, row)], fill=color + (255,))
    draw.rectangle([56, 56, W - 57, H - 57], outline=(58, 54, 46, 255), width=1)
    draw.line([(W // 2 - 60, H - 100), (W // 2 + 60, H - 100)], fill=GOLD + (255,), width=2)
    return bg


def compose(slug: str, pages: list, tmp: Path) -> Image.Image:
    canvas = background()
    imgs = []
    for name, page in pages:
        src = SRC / name
        pdf = to_pdf(src, tmp)
        crop = src.suffix in (".xlsx", ".pptx")
        imgs.append(render_page(pdf, page, tmp, crop))

    front, back = imgs[0], imgs[1:]
    if len(imgs) >= 4:
        # Kit: as capas dos itens em fila no alto, a capa do kit grande na frente.
        n = len(back)
        slot = (W - 220) // n
        for i, img in enumerate(back):
            s = sheet(img, slot - 40, 460) if img.height >= img.width else sheet(img, slot + 60, 300)
            x = 110 + i * slot + (slot - s.width) // 2
            paste_with_shadow(canvas, s, x, 140 + (i % 2) * 40, -3 if i % 2 else 3)
        s = sheet(front, 520, 700)
        paste_with_shadow(canvas, s, (W - s.width) // 2, H - s.height - 150)
        return canvas

    portrait = front.height >= front.width
    if portrait:
        # Documento: capa grande à esquerda, páginas internas atrás à direita.
        for i, img in enumerate(reversed(back)):
            k = len(back) - 1 - i  # 0 = a mais próxima da capa
            if img.height >= img.width:
                s = sheet(img, 600, 760)
                x, y = 780 + k * 110, 160 + k * 50
            else:
                s = sheet(img, 640, 420)
                x, y = W - s.width - 110, 190 + k * 380
            paste_with_shadow(canvas, s, x, y, 3 - k * 4 if img.height >= img.width else (2 if k else -2))
        s = sheet(front, 660, 900)
        paste_with_shadow(canvas, s, 170, (H - s.height) // 2 - 20)
    else:
        # Planilha: telas recortadas sobrepostas, a capa por cima.
        positions = [(560, 150), (300, 560)]
        for (img, (x, y)) in zip(back, positions):
            s = sheet(img, 960, 520)
            paste_with_shadow(canvas, s, min(x, W - s.width - 90), y)
        s = sheet(front, 760, 560)
        paste_with_shadow(canvas, s, 150, 170)
    return canvas


def main():
    only = set(sys.argv[1:])
    OUT.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory() as d:
        tmp = Path(d)
        for slug, pages in PRODUCTS.items():
            if only and slug not in only:
                continue
            img = compose(slug, pages, tmp).convert("RGB")
            img.save(OUT / f"{slug}.jpg", "JPEG", quality=84, optimize=True, progressive=True)
            print("ok", slug)


if __name__ == "__main__":
    main()
