import json
from fastapi import APIRouter, Depends, UploadFile, File, Form, Body
from auth.authorization import Authorization
from mapper.page_index_mapper import query_page_index, add_page, query_page_index_by_id, update_page, delete_page_by_id
from model.exceptions import ServiceException
from model.result import Res
from service.page_index_service import PageIndexService

pub_page_index_router = APIRouter(
    prefix="/api/page/index",
)

pro_page_index_router = APIRouter(
    prefix="/api/page/index",
    dependencies=[Depends(Authorization.val_token)]
)


@pub_page_index_router.get('/list')
async def list_page_index():
    return Res.ok(query_page_index())


@pro_page_index_router.post('/add_page')
async def add_page_index(file: UploadFile = File(...)):
    file_bytes = await file.read()

    data, num_boxes, cls_counts = PageIndexService.process_image(file_bytes)
    image_url = PageIndexService.upload_to_minio(data)

    add_data = {
        'image_url': image_url,
        'num_boxes': num_boxes,
        'cls_counts': json.dumps(cls_counts, ensure_ascii=False)
    }
    add_page(add_data)
    return Res.ok("添加成功")


@pro_page_index_router.post('/update_page')
async def update_page_index(id: int = Form(...), file: UploadFile = File(...)):
    page = query_page_index_by_id(id)
    if not page:
        raise ServiceException(msg="轮播图不存在")

    PageIndexService.delete_minio_file(page[0]["image_url"])

    file_bytes = await file.read()
    data, num_boxes, cls_counts = PageIndexService.process_image(file_bytes)
    image_url = PageIndexService.upload_to_minio(data)

    update_data = {
        "image_url": image_url,
        "num_boxes": num_boxes,
        "cls_counts": json.dumps(cls_counts, ensure_ascii=False),
    }
    update_page(id, update_data)
    return Res.ok("修改成功")


@pro_page_index_router.post('/delete_page')
async def delete_page_index(data: dict = Body(...)):
    ids = data.get("ids")
    if not ids:
        raise ServiceException(msg="请选择要删除的轮播图")
    for id in ids:
        page = query_page_index_by_id(id)
        PageIndexService.delete_minio_file(page[0]["image_url"])
        delete_page_by_id(id)

    return Res.ok("删除成功")
