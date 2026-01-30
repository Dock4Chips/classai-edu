import os
import uuid
from datetime import datetime
from typing import Optional

import cv2
import numpy as np
from fastapi import UploadFile

from config.config import bucket, MINIO_BUCKET_NAME
from master_tools.logger_tool import log


async def upload_file_to_minio(file: UploadFile) -> str:
    """
    上传文件到MinIO（普通IO数据）
    :param file: FastAPI UploadFile对象
    :return: 文件URL
    """
    suffix = os.path.splitext(file.filename)[1] or ".jpg"
    date_path = datetime.now().strftime("%Y/%m/%d")
    object_name = f"{date_path}/{uuid.uuid4().hex}{suffix}"
    data = file.file.read()
    bucket.upload_data_to_bucket(
        bucket_name=MINIO_BUCKET_NAME,
        object_name=object_name,
        data=data,
        content_type=file.content_type
    )
    return bucket.minioClient.get_object_url(
        MINIO_BUCKET_NAME,
        object_name
    )


def upload_np_image_to_minio(img: np.ndarray, suffix: str = ".jpg") -> str:
    """
    上传numpy图片数据到MinIO（cv2编码后的数据）
    :param img: numpy图片数组
    :param suffix: 文件后缀
    :return: 预签名URL
    """
    date_path = datetime.now().strftime("%Y/%m/%d")
    object_name = f"{date_path}/{uuid.uuid4()}{suffix}"
    success, buffer = cv2.imencode(suffix, img)
    if not success:
        raise Exception("图片编码失败")
    bucket.upload_data_to_bucket(
        bucket_name=MINIO_BUCKET_NAME,
        object_name=object_name,
        data=buffer,
        content_type="image/jpeg"
    )
    return bucket.minioClient.get_object_url(
        MINIO_BUCKET_NAME,
        object_name
    )


def delete_minio_file(image_url: Optional[str]):
    """
    从MinIO删除文件
    :param image_url: 文件URL
    """
    if not image_url:
        return
    try:
        object_key = image_url.split("?")[0].split(f"{MINIO_BUCKET_NAME}/")[1]
        bucket.minioClient.remove_object(MINIO_BUCKET_NAME, object_key)
    except Exception as e:
        log.error(f"删除MinIO文件失败: {e}")