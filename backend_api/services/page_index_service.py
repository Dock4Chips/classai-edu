import uuid
from datetime import datetime
import cv2
import numpy as np

from config.config import bucket, MINIO_BUCKET_NAME
from model.exceptions import ServiceException
from yolo_edu.core.predict import PreAct
from master_tools.logger_tool import log

class PageIndexService:

    @staticmethod
    def process_image(file_bytes: bytes):
        """图片读取 + 目标检测 + 结果生成"""
        np_img = np.frombuffer(file_bytes, np.uint8)
        img = cv2.imdecode(np_img, cv2.IMREAD_COLOR)
        if img is None:
            raise ServiceException(msg="图片读取失败")

        PreAct.init(img, conf=0.5)
        pre_img = PreAct.pre_act_local()
        num_boxes, cls_counts = PreAct.count_act()

        success, buffer = cv2.imencode(".jpg", pre_img)
        if not success:
            raise ServiceException(msg="图片处理失败")

        return buffer.tobytes(), num_boxes, cls_counts

    @staticmethod
    def upload_to_minio(data: bytes):
        """上传文件到 Minio 并返回 URL"""
        date_path = datetime.now().strftime("%Y/%m/%d")
        unique_filename = f"{date_path}/{uuid.uuid4()}"

        bucket.upload_data_to_bucket(
            bucket_name=MINIO_BUCKET_NAME,
            object_name=unique_filename,
            data=data,
            content_type="image/jpeg"
        )

        return bucket.minioClient.presigned_get_object(
            MINIO_BUCKET_NAME,
            unique_filename
        )

    @staticmethod
    def delete_minio_file(image_url: str):
        """从 URL 中解析 Key 并删除"""
        try:
            object_key = image_url.split("?")[0].split(f"{MINIO_BUCKET_NAME}/")[1]
            bucket.minioClient.remove_object(MINIO_BUCKET_NAME, object_key)
        except Exception as e:
            log.error(e)

