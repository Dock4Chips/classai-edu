from fastapi import APIRouter,Depends
from auth.authorization import Authorization
from constant.constant import ALLOWED_CLASSES
from model.exceptions import ServiceException
from model.result import Res
import sys
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(BASE_DIR)

from yolo_edu.core.predict import GetPos, PreAct

pro_yolo_router = APIRouter(
    prefix="/api/yolo/img",
    dependencies=[Depends(Authorization.val_token)]
)


@pro_yolo_router.get("/predict/act")
async def yolo_predict_act(img_path: str, conf: float):
    if not img_path:
        raise ServiceException(msg="请先选择所需预测的图片")
    PreAct.init(img_path, conf)
    base64_img = PreAct.pre_act()
    num_boxes, cls_counts = PreAct.count_act()
    data = {
        "image_base64": base64_img,
        "num_boxes": num_boxes,
        "cls_counts": cls_counts
    }
    return Res.ok(data=data)


@pro_yolo_router.get("/predict/pos")
async def yolo_predict_pos(img_path: str, class_name: str):
    if not img_path or not class_name:
        raise ServiceException(msg="请先选择所需预测的图片和预测的行为")
    if class_name not in ALLOWED_CLASSES:
        raise ServiceException(msg=f"行为类别非法，仅允许: {ALLOWED_CLASSES}")
    GetPos.init(img_path)
    base64_img = GetPos.only_class(class_name)
    pos = GetPos.get_pos(class_name)
    data = {
        "image_base64": base64_img,
        "pos": pos
    }
    return Res.ok(data=data)
