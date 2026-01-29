import os
import uuid
from datetime import datetime

from fastapi import UploadFile

from config.config import bucket, MINIO_BUCKET_NAME




async def upload_to_minio(file: UploadFile) -> str:
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

