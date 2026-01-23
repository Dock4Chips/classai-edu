import base64
from ultralytics import YOLO
import cv2
from master_tools.logger_tool import log
from collections import Counter


class PreAct:
    result = None

    @classmethod
    def init(cls, source, conf=0.5):
        yolo = YOLO(model='../model/classai_8n.pt', task='detect')
        cls.result = yolo(source=source, save=False, conf=conf)

    @classmethod
    def __change_img_base64(cls, img):
        img_bgr = cv2.cvtColor(img, cv2.COLOR_RGB2BGR)
        success, buffer = cv2.imencode(".jpg", img_bgr)
        if not success:
            raise ValueError("cv2.imencode failed")
        img_base64 = base64.b64encode(buffer.tobytes()).decode()
        return img_base64

    @classmethod
    def pre_act(cls):
        img = cls.result[0].plot()
        return cls.__change_img_base64(img)

    @classmethod
    def pre_act_local(cls):
        return cls.result[0].plot()

    @classmethod
    def count_act(cls):
        num_boxes = len(cls.result[0].boxes.cls)
        cls_indices = cls.result[0].boxes.cls.cpu().numpy()
        cls_names = cls.result[0].names
        cls_counts = Counter([cls_names[int(idx)] for idx in cls_indices])
        return num_boxes, dict(cls_counts)


class GetPos:
    result = None
    yolo = None

    @classmethod
    def init(cls, source):
        cls.yolo = YOLO(model='../model/classai_8n.pt', task='detect')
        cls.result = cls.yolo(source=source, save=False, classes=None)

    @classmethod
    def __get_classai_id(cls, classai_name: str):
        for i in cls.result[0].names:
            if cls.result[0].names[i] == classai_name:
                return i
        return None

    @classmethod
    def __get_cls_no(cls, classai_id: int):
        for idx, item in enumerate(cls.result[0].boxes.cls):
            if item == classai_id:
                return idx
        return None

    @classmethod
    def __get_xy(cls, cls_no: int):
        x = cls.result[0].boxes.xywh[cls_no][0]
        y = cls.result[0].boxes.xywh[cls_no][1]
        return x, y

    @classmethod
    def __change_img_base64(cls, img):
        img_bgr = cv2.cvtColor(img, cv2.COLOR_RGB2BGR)
        success, buffer = cv2.imencode(".jpg", img_bgr)
        if not success:
            raise ValueError("cv2.imencode failed")
        img_base64 = base64.b64encode(buffer.tobytes()).decode()
        return img_base64

    @classmethod
    def get_pos(cls, classai_name: str):
        classai_id = cls.__get_classai_id(classai_name)
        cls_no = cls.__get_cls_no(classai_id)
        pos = cls.__get_xy(cls_no)
        return pos

    @classmethod
    def only_class(cls, classai_name: str):
        """根据类别名只显示该类别"""
        class_id = cls.__get_classai_id(classai_name)
        result = cls.yolo(source=cls.result[0].path, save=False, classes=[class_id])
        img = result[0].plot()
        return cls.__change_img_base64(img)


if __name__ == '__main__':
    # classai_name = 'sharing_answers'
    # GetPos.init('../yolo_edu/datasets/val/images/160.jpg')
    # # classai_pos = GetPos.get_pos(classai_name)
    # # log.info(classai_pos)
    # GetPos.only_class(classai_name)

    PreAct.init('../yolo_edu/datasets/val/images/160.jpg')
    PreAct.pre_act()
    num_boxes,cls_counts = PreAct.count_act()
    log.info(num_boxes)
    log.info(cls_counts)
