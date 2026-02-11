"""
颜色转换工具函数
"""
from models.exceptions import ServiceException


def hex_to_rgb(hex_color: str) -> str:
    hex_color = hex_color.lstrip('#')
    if len(hex_color) != 6:
        raise ServiceException(msg="无效的十六进制颜色")

    try:
        # 转换为RGB值
        r = int(hex_color[0:2], 16)
        g = int(hex_color[2:4], 16)
        b = int(hex_color[4:6], 16)

        return f"rgb({r}, {g}, {b})"
    except ValueError:
        raise ServiceException(msg="无效的十六进制颜色")


def hex_to_bgr(hex_color: str) -> str:
    hex_color = hex_color.lstrip('#')
    if len(hex_color) != 6:
        raise ServiceException(msg="无效的十六进制颜色")
    try:
        r = int(hex_color[0:2], 16)
        g = int(hex_color[2:4], 16)
        b = int(hex_color[4:6], 16)

        return f"({b}, {g}, {r})"
    except ValueError:
        raise ServiceException(msg="无效的十六进制颜色")


def update_color_from_hex(data: dict) -> dict:
    if 'color_hex' in data and data['color_hex']:
        hex_color = data['color_hex']
        data['color_rgb'] = hex_to_rgb(hex_color)
        data['color_bgr'] = hex_to_bgr(hex_color)

    return data