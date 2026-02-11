from fastapi import APIRouter, Depends, Query
from auth.authorization import Authorization
from models.exceptions import ServiceException
from models.result import Res
from repository.model_draw_config_repository import (
    get_model_draw_config_by_id,
    get_model_draw_config_by_model_id,
    page_list_model_draw_config,
    create_model_draw_config,
    update_model_draw_config,
    delete_model_draw_config
)
from tools.color_tool import update_color_from_hex

pro_model_draw_config_router = APIRouter(
    prefix='/api/model/draw/config',
    dependencies=[Depends(Authorization.val_token)]
)


@pro_model_draw_config_router.get('/list')
async def list_model_draw_config(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100)
):
    """分页查询绘图配置列表"""
    result = page_list_model_draw_config(page, page_size)
    return Res.ok(result)


@pro_model_draw_config_router.get('/by_model/{model_id}')
async def get_model_draw_config_by_model(model_id: int):
    """根据模型ID获取所有绘图配置"""
    configs = get_model_draw_config_by_model_id(model_id)
    return Res.ok(configs)


@pro_model_draw_config_router.get('/{config_id}')
async def get_model_draw_config(config_id: int):
    """根据ID获取绘图配置"""
    config = get_model_draw_config_by_id(config_id)
    if not config:
        raise ServiceException(msg="绘图配置不存在")
    return Res.ok(config)


@pro_model_draw_config_router.post('')
async def add_model_draw_config(data: dict):
    """新增绘图配置"""
    # 如果前端传了 color_hex，自动生成 color_rgb 和 color_bgr
    data = update_color_from_hex(data)
    create_model_draw_config(data)
    return Res.ok("新增成功")


@pro_model_draw_config_router.put('/{config_id}')
async def edit_model_draw_config(config_id: int, data: dict):
    """修改绘图配置"""
    # 如果前端传了 color_hex，自动生成 color_rgb 和 color_bgr
    data = update_color_from_hex(data)
    update_model_draw_config(config_id, data)
    return Res.ok("修改成功")


@pro_model_draw_config_router.delete('/{config_id}')
async def remove_model_draw_config(config_id: int):
    """删除绘图配置"""
    delete_model_draw_config(config_id)
    return Res.ok("删除成功")