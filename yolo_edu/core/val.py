#
#
from ultralytics import YOLO
from ultralytics.utils.plotting import Colors

model_8n = r'/Users/dock4chips/Script-P/classai-edu/model/classai_8n.pt'
model_11n = r'/Users/dock4chips/Script-P/classai-edu/model/classai_8n.pt'
source = '/Users/dock4chips/Script-P/classai-edu/yolo_edu/datasets/active/val/images/0a5bc839-data_rbg_frame1449.jpg'
yolo = YOLO(model=model_8n, task='detect')
results = yolo(source=source,save=False)

names = results[0].names  # 或 model.names
colors = Colors()

def rgb_to_hex(rgb):
    return '#{:02X}{:02X}{:02X}'.format(*rgb)

for cls_id, cls_name in names.items():
    rgb = colors(cls_id, bgr=False)
    hex_color = rgb_to_hex(rgb)
    print(f'class {cls_id}: {cls_name}, color={hex_color}')

