import cv2
from ultralytics import YOLO

from master_tools.logger_tool import logging_config

# log = logging_config.setup_basic_logging()
#
# yolo = YOLO(model='classai_8n.pt', task='detect')
# results = yolo.val(
#     data='data.yaml',
#     save_json=True,
#     batch=128,
#     half=True,
#     save=True
#
# )
#
# log.info(results)


yolo = YOLO(model='../model/classai_8n.pt', task='detect')

img = cv2.imread('../yolo_edu/datasets/val/images/160.jpg')

result =  yolo.predict(source=img)
boxes = result[0].boxes
for box in boxes:
    x1,y1,x2,y2 =  box.xyxy[0].cpu().numpy().astype(int)
    # 坐标
    cv2.rectangle(img,(x1,y1),(x2,y2),(0,0,255),1)
    # 标签
    cls = int(box.cls[0])
    cv2.putText(img,yolo.model.names[cls],(x1,y1),cv2.FONT_HERSHEY_PLAIN,1,(0,255,0),1)
    # 置信度
    conf = float(box.conf[0])
    cv2.putText(img,str(conf),(x1,y1),cv2.FONT_HERSHEY_PLAIN,1,(0,255,0),1)
cv2.imshow("im",img)
cv2.waitKey(0)
# results[0].show()



