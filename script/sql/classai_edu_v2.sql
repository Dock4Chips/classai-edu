-- ========================================
-- ClassAI-Edu 数据库设计 V2.0
-- 重新设计版本 - 最佳实践
-- ========================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- 1. 模型管理模块
-- ----------------------------

-- 模型配置表
DROP TABLE IF EXISTS `model_config`;
CREATE TABLE `model_config` (
  `model_id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '模型ID',
  `model_name` VARCHAR(100) NOT NULL COMMENT '模型名称',
  `model_version` VARCHAR(50) DEFAULT NULL COMMENT '模型版本',
  `model_type` VARCHAR(50) DEFAULT 'yolov8' COMMENT '模型类型 yolov8/yolov11',
  `model_size` VARCHAR(20) DEFAULT 'n' COMMENT '模型大小 n/s/m/l/x',

  -- 模型文件
  `model_path` VARCHAR(500) NOT NULL COMMENT '模型文件路径',
  `model_url` VARCHAR(500) DEFAULT NULL COMMENT '模型下载地址',
  `model_size_mb` DECIMAL(10,2) DEFAULT NULL COMMENT '模型文件大小(MB)',

  -- 模型参数
  `input_size` INT DEFAULT 640 COMMENT '输入图像尺寸',
  `num_classes` INT DEFAULT 6 COMMENT '类别数量',
  `precision` VARCHAR(20) DEFAULT 'fp32' COMMENT '精度类型 fp32/fp16/int8',

  -- 性能指标
  `inference_time_ms` INT DEFAULT NULL COMMENT '平均推理时间(毫秒)',
  `map50` DECIMAL(5,4) DEFAULT NULL COMMENT 'mAP@50',
  `map50_95` DECIMAL(5,4) DEFAULT NULL COMMENT 'mAP@50-95',

  -- 训练信息
  `training_epochs` INT DEFAULT NULL COMMENT '训练轮数',
  `training_dataset` VARCHAR(255) DEFAULT NULL COMMENT '训练数据集',

  -- 状态
  `is_default` TINYINT(1) DEFAULT 0 COMMENT '是否默认模型',
  `is_active` TINYINT(1) DEFAULT 1 COMMENT '是否启用',
  `description` TEXT COMMENT '模型描述',

  -- 审计字段
  `is_deleted` TINYINT(1) DEFAULT 0 COMMENT '删除标志',
  `created_by` BIGINT DEFAULT NULL COMMENT '创建人ID',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_by` BIGINT DEFAULT NULL COMMENT '更新人ID',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',

  PRIMARY KEY (`model_id`),
  UNIQUE KEY `uk_model_name` (`model_name`),
  KEY `idx_is_default` (`is_default`),
  KEY `idx_is_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='模型配置表';

-- 模型类别表
DROP TABLE IF EXISTS `model_class`;
CREATE TABLE `model_class` (
  `class_id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '类别ID',
  `model_id` BIGINT NOT NULL COMMENT '所属模型ID',

  -- 类别信息
  `class_name` VARCHAR(50) NOT NULL COMMENT '类别名称(代码)',
  `class_name_en` VARCHAR(50) NOT NULL COMMENT '英文名称',
  `class_name_zh` VARCHAR(50) NOT NULL COMMENT '中文名称',
  `class_index` INT NOT NULL COMMENT '类别索引(0-5)',
  `class_code` VARCHAR(20) DEFAULT NULL COMMENT '类别代码',

  -- 配置
  `description` TEXT COMMENT '类别描述',
  `is_active` TINYINT(1) DEFAULT 1 COMMENT '是否启用',
  `sort_order` INT DEFAULT 0 COMMENT '排序',

  -- 审计字段
  `is_deleted` TINYINT(1) DEFAULT 0 COMMENT '删除标志',
  `created_by` BIGINT DEFAULT NULL COMMENT '创建人ID',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_by` BIGINT DEFAULT NULL COMMENT '更新人ID',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',

  PRIMARY KEY (`class_id`),
  UNIQUE KEY `uk_model_class` (`model_id`, `class_index`),
  KEY `idx_class_name` (`class_name`),
  CONSTRAINT `fk_model_class_model` FOREIGN KEY (`model_id`) REFERENCES `model_config`(`model_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='模型类别表';

-- 模型绘图配置表
DROP TABLE IF EXISTS `model_draw_config`;
CREATE TABLE `model_draw_config` (
  `config_id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '配置ID',
  `model_id` BIGINT NOT NULL COMMENT '模型ID',
  `class_id` BIGINT NOT NULL COMMENT '类别ID',

  -- 颜色配置
  `color_name` VARCHAR(50) DEFAULT NULL COMMENT '颜色名称',
  `color_hex` VARCHAR(20) NOT NULL COMMENT '十六进制颜色 #FF0000',
  `color_rgb` VARCHAR(30) DEFAULT NULL COMMENT 'RGB颜色 rgb(255,0,0)',
  `color_bgr` VARCHAR(30) DEFAULT NULL COMMENT 'BGR颜色 (0,0,255) OpenCV格式',

  -- 边框配置
  `border_thickness` INT DEFAULT 2 COMMENT '边框粗细',
  `border_alpha` DECIMAL(3,2) DEFAULT 0.80 COMMENT '边框透明度',

  -- 文本配置
  `display_label` TINYINT(1) DEFAULT 1 COMMENT '是否显示标签',
  `display_confidence` TINYINT(1) DEFAULT 1 COMMENT '是否显示置信度',
  `font_scale` DECIMAL(3,2) DEFAULT 0.50 COMMENT '字体大小',
  `font_thickness` INT DEFAULT 1 COMMENT '字体粗细',
  `text_color` VARCHAR(20) DEFAULT '#FFFFFF' COMMENT '文本颜色',
  `background_color` VARCHAR(20) DEFAULT NULL COMMENT '背景颜色',

  -- 显示控制
  `display_box` TINYINT(1) DEFAULT 1 COMMENT '是否显示边框',
  `box_fill` TINYINT(1) DEFAULT 0 COMMENT '是否填充边框',

  -- 默认标记
  `is_default` TINYINT(1) DEFAULT 0 COMMENT '是否默认配置',

  -- 审计字段
  `is_deleted` TINYINT(1) DEFAULT 0 COMMENT '删除标志',
  `created_by` BIGINT DEFAULT NULL COMMENT '创建人ID',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_by` BIGINT DEFAULT NULL COMMENT '更新人ID',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',

  PRIMARY KEY (`config_id`),
  UNIQUE KEY `uk_model_class_draw` (`model_id`, `class_id`),
  KEY `idx_class_id` (`class_id`),
  CONSTRAINT `fk_draw_config_model` FOREIGN KEY (`model_id`) REFERENCES `model_config`(`model_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_draw_config_class` FOREIGN KEY (`class_id`) REFERENCES `model_class`(`class_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='模型绘图配置表';

-- ----------------------------
-- 2. 资源管理模块
-- ----------------------------

-- 统一资源表 (支持图片、视频、实时流)
DROP TABLE IF EXISTS `resource`;
CREATE TABLE `resource` (
  `resource_id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '资源ID',
  `resource_type` TINYINT NOT NULL COMMENT '资源类型 0=image 1=cap 2=stream 3=batch',

  -- 基本信息
  `resource_name` VARCHAR(200) NOT NULL COMMENT '资源名称',
  `resource_path` VARCHAR(500) NOT NULL COMMENT '资源路径',
  `resource_url` VARCHAR(500) DEFAULT NULL COMMENT '资源URL',

  -- 缩略图
  `thumbnail_path` VARCHAR(500) DEFAULT NULL COMMENT '缩略图路径',
  `thumbnail_url` VARCHAR(500) DEFAULT NULL COMMENT '缩略图URL',

  -- 文件信息
  `file_format` VARCHAR(20) DEFAULT NULL COMMENT '文件格式 jpg/mp4等',
  `file_size_mb` DECIMAL(10,2) DEFAULT NULL COMMENT '文件大小(MB)',

  -- 图像/视频属性
  `width` INT DEFAULT NULL COMMENT '宽度',
  `height` INT DEFAULT NULL COMMENT '高度',
  `channels` INT DEFAULT NULL COMMENT '通道数(仅图片)',
  `fps` DECIMAL(5,2) DEFAULT NULL COMMENT '帧率(视频)',
  `total_frames` INT DEFAULT NULL COMMENT '总帧数(视频)',
  `duration_seconds` INT DEFAULT NULL COMMENT '时长(秒)(视频)',

  -- 视频编码信息
  `codec` VARCHAR(50) DEFAULT NULL COMMENT '编码格式',
  `bitrate` INT DEFAULT NULL COMMENT '比特率',

  -- 来源信息
  `source_type` TINYINT NOT NULL COMMENT '来源类型 0=upload 1=url 2=camera 3=rtsp 4=file',
  `original_path` VARCHAR(500) DEFAULT NULL COMMENT '原始路径',

  -- 元数据
  `location` VARCHAR(200) DEFAULT NULL COMMENT '拍摄位置',
  `capture_time` DATETIME DEFAULT NULL COMMENT '拍摄时间',
  `description` TEXT COMMENT '描述',

  -- 状态
  `status` TINYINT DEFAULT 0 COMMENT '状态 0=ready 1=processing 2=completed 3=error',

  -- 审计字段
  `uploaded_by` BIGINT DEFAULT NULL COMMENT '上传人ID',
  `is_deleted` TINYINT(1) DEFAULT 0 COMMENT '删除标志',
  `created_by` BIGINT DEFAULT NULL COMMENT '创建人ID',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_by` BIGINT DEFAULT NULL COMMENT '更新人ID',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',

  PRIMARY KEY (`resource_id`),
  KEY `idx_resource_type` (`resource_type`),
  KEY `idx_source_type` (`source_type`),
  KEY `idx_status` (`status`),
  KEY `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='统一资源表';

-- ----------------------------
-- 3. 设备管理模块
-- ----------------------------

-- 设备表 (摄像头、无人机等)
DROP TABLE IF EXISTS `device`;
CREATE TABLE `device` (
  `device_id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '设备ID',

  -- 基本信息
  `device_name` VARCHAR(100) NOT NULL COMMENT '设备名称',
  `device_type` TINYINT NOT NULL COMMENT '设备类型 0=camera 1=drone 2=ip_camera 3=usb_camera',
  `device_code` VARCHAR(100) DEFAULT NULL COMMENT '设备编码',

  -- 连接信息
  `connection_type` TINYINT DEFAULT 0 COMMENT '连接类型 0=rtsp 1=http 2=usb 3=file',
  `rtsp_url` VARCHAR(500) DEFAULT NULL COMMENT 'RTSP地址',
  `http_url` VARCHAR(500) DEFAULT NULL COMMENT 'HTTP地址',
  `device_index` INT DEFAULT NULL COMMENT '设备索引(USB摄像头)',

  -- 设备属性
  `location` VARCHAR(200) DEFAULT NULL COMMENT '安装位置',
  `resolution` VARCHAR(20) DEFAULT '1920x1080' COMMENT '分辨率',
  `fps` INT DEFAULT 25 COMMENT '帧率',
  `ptz_support` TINYINT(1) DEFAULT 0 COMMENT '是否支持云台',

  -- 状态
  `status` TINYINT DEFAULT 1 COMMENT '设备状态 0=online 1=offline 2=error 3=maintenance',
  `last_heartbeat` DATETIME DEFAULT NULL COMMENT '最后心跳时间',
  `last_online_time` DATETIME DEFAULT NULL COMMENT '最后在线时间',

  -- 配置
  `description` TEXT COMMENT '描述',
  `is_enabled` TINYINT(1) DEFAULT 1 COMMENT '是否启用',

  -- 审计字段
  `is_deleted` TINYINT(1) DEFAULT 0 COMMENT '删除标志',
  `created_by` BIGINT DEFAULT NULL COMMENT '创建人ID',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_by` BIGINT DEFAULT NULL COMMENT '更新人ID',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',

  PRIMARY KEY (`device_id`),
  UNIQUE KEY `uk_device_code` (`device_code`),
  KEY `idx_device_type` (`device_type`),
  KEY `idx_status` (`status`),
  KEY `idx_is_enabled` (`is_enabled`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='设备表';

-- ----------------------------
-- 4. 检测任务模块
-- ----------------------------

-- 检测任务表 (只存储任务配置和状态)
DROP TABLE IF EXISTS `detection_task`;
CREATE TABLE `detection_task` (
  `task_id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '任务ID',

  -- 基本信息
  `task_name` VARCHAR(200) NOT NULL COMMENT '任务名称',
  `task_type` TINYINT NOT NULL COMMENT '任务类型 0=image 1=cap 2=stream 3=batch',
  `task_status` TINYINT DEFAULT 0 COMMENT '任务状态 0=pending 1=queued 2=running 3=completed 4=failed 5=cancelled 6=timeout',

  -- 模型配置
  `model_id` BIGINT NOT NULL COMMENT '使用的模型ID',
  `conf_threshold` DECIMAL(5,4) DEFAULT 0.5000 COMMENT '置信度阈值',
  `iou_threshold` DECIMAL(5,4) DEFAULT 0.4500 COMMENT 'IOU阈值',

  -- 检测配置
  `enable_tracking` TINYINT(1) DEFAULT 0 COMMENT '是否启用目标跟踪',
  `save_annotated` TINYINT(1) DEFAULT 1 COMMENT '是否保存标注结果',
  `save_frames` TINYINT(1) DEFAULT 0 COMMENT '是否保存关键帧',

  -- 资源关联 (三选一)
  `resource_id` BIGINT DEFAULT NULL COMMENT '资源ID(单图/视频)',
  `device_id` BIGINT DEFAULT NULL COMMENT '设备ID(实时流)',
  `batch_resource_ids` TEXT DEFAULT NULL COMMENT '批量资源ID列表(JSON)',

  -- 输出配置
  `output_format` TINYINT DEFAULT 0 COMMENT '输出格式 0=json 1=coco 2=voc 3=yolo',
  `output_path` VARCHAR(500) DEFAULT NULL COMMENT '输出文件路径',

  -- 实时任务专用
  `is_active` TINYINT(1) DEFAULT 0 COMMENT '实时任务是否活跃',
  `auto_restart` TINYINT(1) DEFAULT 0 COMMENT '异常后是否自动重启',
  `max_retries` INT DEFAULT 3 COMMENT '最大重试次数',
  `retry_count` INT DEFAULT 0 COMMENT '已重试次数',
  `stop_reason` VARCHAR(100) DEFAULT NULL COMMENT '停止原因',

  -- 进度信息
  `total_frames` INT DEFAULT 0 COMMENT '总帧数',
  `processed_frames` INT DEFAULT 0 COMMENT '已处理帧数',
  `progress_pct` DECIMAL(5,2) DEFAULT 0.00 COMMENT '进度百分比',

  -- 时间信息
  `queued_time` DATETIME DEFAULT NULL COMMENT '入队时间',
  `start_time` DATETIME DEFAULT NULL COMMENT '开始时间',
  `end_time` DATETIME DEFAULT NULL COMMENT '结束时间',
  `duration_seconds` INT DEFAULT NULL COMMENT '耗时(秒)',

  -- 错误信息
  `error_message` TEXT DEFAULT NULL COMMENT '错误信息',
  `error_stack` TEXT DEFAULT NULL COMMENT '错误堆栈',

  -- 优先级
  `priority` INT DEFAULT 5 COMMENT '优先级(1-10, 数字越大优先级越高)',

  -- 审计字段
  `created_by` BIGINT DEFAULT NULL COMMENT '创建人ID',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_by` BIGINT DEFAULT NULL COMMENT '更新人ID',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',

  PRIMARY KEY (`task_id`),
  KEY `idx_task_type_status` (`task_type`, `task_status`),
  KEY `idx_model_id` (`model_id`),
  KEY `idx_resource_id` (`resource_id`),
  KEY `idx_device_id` (`device_id`),
  KEY `idx_is_active` (`is_active`),
  KEY `idx_create_time` (`create_time`),
  KEY `idx_priority` (`priority`),

  CONSTRAINT `fk_task_model` FOREIGN KEY (`model_id`) REFERENCES `model_config`(`model_id`),
  CONSTRAINT `fk_task_resource` FOREIGN KEY (`resource_id`) REFERENCES `resource`(`resource_id`) ON DELETE SET NULL,
  CONSTRAINT `fk_task_device` FOREIGN KEY (`device_id`) REFERENCES `device`(`device_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='检测任务表';

-- ----------------------------
-- 5. 检测结果模块
-- ----------------------------

-- 检测汇总表 (任务级别的统计)
DROP TABLE IF EXISTS `detection_summary`;
CREATE TABLE `detection_summary` (
  `summary_id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '汇总ID',
  `task_id` BIGINT NOT NULL COMMENT '任务ID',

  -- 统计信息
  `total_detections` INT DEFAULT 0 COMMENT '总检测数',
  `num_frames` INT DEFAULT 0 COMMENT '检测帧数',

  -- 处理性能
  `processing_time_ms` INT DEFAULT NULL COMMENT '总处理时间(毫秒)',
  `avg_fps` DECIMAL(5,2) DEFAULT NULL COMMENT '平均FPS',
  `avg_time_per_frame_ms` INT DEFAULT NULL COMMENT '平均每帧处理时间(毫秒)',

  -- 输出文件
  `annotated_video_url` VARCHAR(500) DEFAULT NULL COMMENT '标注视频URL',
  `annotated_frames_url` VARCHAR(500) DEFAULT NULL COMMENT '标注帧打包URL',
  `result_json_url` VARCHAR(500) DEFAULT NULL COMMENT '结果JSON文件URL',

  -- 各类别统计
  `class_stats` JSON DEFAULT NULL COMMENT '各类别统计JSON',

  -- 审计字段
  `created_by` BIGINT DEFAULT NULL COMMENT '创建人ID',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_by` BIGINT DEFAULT NULL COMMENT '更新人ID',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',

  PRIMARY KEY (`summary_id`),
  UNIQUE KEY `uk_task_summary` (`task_id`),
  KEY `idx_total_detections` (`total_detections`),

  CONSTRAINT `fk_summary_task` FOREIGN KEY (`task_id`) REFERENCES `detection_task`(`task_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='检测汇总表';

-- 类别统计表 (更灵活的统计方式)
DROP TABLE IF EXISTS `detection_class_count`;
CREATE TABLE `detection_class_count` (
  `count_id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '统计ID',
  `task_id` BIGINT NOT NULL COMMENT '任务ID',
  `class_id` BIGINT NOT NULL COMMENT '类别ID',
  `class_name` VARCHAR(50) NOT NULL COMMENT '类别名称',

  -- 统计数据
  `count` INT DEFAULT 0 COMMENT '检测次数',
  `avg_confidence` DECIMAL(5,4) DEFAULT NULL COMMENT '平均置信度',
  `max_confidence` DECIMAL(5,4) DEFAULT NULL COMMENT '最大置信度',
  `min_confidence` DECIMAL(5,4) DEFAULT NULL COMMENT '最小置信度',

  -- 时间占比
  `duration_seconds` DECIMAL(10,3) DEFAULT NULL COMMENT '持续时间(秒)',
  `percentage` DECIMAL(5,2) DEFAULT NULL COMMENT '占比(%)',

  -- 审计字段
  `created_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',

  PRIMARY KEY (`count_id`),
  UNIQUE KEY `uk_task_class` (`task_id`, `class_id`),
  KEY `idx_class_name` (`class_name`),
  KEY `idx_count` (`count`),

  CONSTRAINT `fk_class_count_task` FOREIGN KEY (`task_id`) REFERENCES `detection_task`(`task_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_class_count_class` FOREIGN KEY (`class_id`) REFERENCES `model_class`(`class_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='类别统计表';

-- 检测详情表 (每帧每个检测框)
DROP TABLE IF EXISTS `detection_detail`;
CREATE TABLE `detection_detail` (
  `detail_id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '详情ID',
  `task_id` BIGINT NOT NULL COMMENT '任务ID',
  `class_id` BIGINT NOT NULL COMMENT '类别ID',
  `class_name` VARCHAR(50) NOT NULL COMMENT '类别名称',
  `class_index` INT NOT NULL COMMENT '类别索引',

  -- 帧信息
  `frame_index` INT DEFAULT NULL COMMENT '帧索引',
  `timestamp_ms` BIGINT DEFAULT NULL COMMENT '时间戳(毫秒)',

  -- 检测结果
  `confidence` DECIMAL(5,4) NOT NULL COMMENT '置信度',

  -- 边界框 (XYXY格式)
  `bbox_x1` DECIMAL(10,2) NOT NULL COMMENT '边界框x1',
  `bbox_y1` DECIMAL(10,2) NOT NULL COMMENT '边界框y1',
  `bbox_x2` DECIMAL(10,2) NOT NULL COMMENT '边界框x2',
  `bbox_y2` DECIMAL(10,2) NOT NULL COMMENT '边界框y2',

  -- 边界框 (中心点和尺寸，计算得出)
  `bbox_center_x` DECIMAL(10,2) GENERATED ALWAYS AS ((`bbox_x1` + `bbox_x2`) / 2) STORED COMMENT '中心点X',
  `bbox_center_y` DECIMAL(10,2) GENERATED ALWAYS AS ((`bbox_y1` + `bbox_y2`) / 2) STORED COMMENT '中心点Y',
  `bbox_width` DECIMAL(10,2) GENERATED ALWAYS AS (`bbox_x2` - `bbox_x1`) STORED COMMENT '宽度',
  `bbox_height` DECIMAL(10,2) GENERATED ALWAYS AS (`bbox_y2` - `bbox_y1`) STORED COMMENT '高度',
  `bbox_area` DECIMAL(10,2) GENERATED ALWAYS AS ((`bbox_x2` - `bbox_x1`) * (`bbox_y2` - `bbox_y1`)) STORED COMMENT '面积',

  -- 跟踪信息
  `track_id` INT DEFAULT NULL COMMENT '跟踪ID',
  `track_age` INT DEFAULT NULL COMMENT '跟踪年龄(帧数)',
  `track_status` TINYINT DEFAULT 0 COMMENT '跟踪状态 0=active 1=lost 2=removed',

  -- 遮挡状态
  `is_occluded` TINYINT(1) DEFAULT 0 COMMENT '是否被遮挡',
  `is_truncated` TINYINT(1) DEFAULT 0 COMMENT '是否被截断',
  `is_out_of_frame` TINYINT(1) DEFAULT 0 COMMENT '是否超出画面',

  -- 绘图配置 (冗余存储，提升性能)
  `draw_color` VARCHAR(20) DEFAULT NULL COMMENT '绘制颜色',

  -- 时间戳
  `detection_time` DATETIME DEFAULT NULL COMMENT '检测时间',

  -- 审计字段
  `created_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',

  PRIMARY KEY (`detail_id`),
  KEY `idx_task_id` (`task_id`),
  KEY `idx_class_id` (`class_id`),
  KEY `idx_class_name` (`class_name`),
  KEY `idx_frame_index` (`frame_index`),
  KEY `idx_track_id` (`track_id`),
  KEY `idx_confidence` (`confidence`),
  KEY `idx_detection_time` (`detection_time`),
  KEY `idx_task_class` (`task_id`, `class_name`),

  CONSTRAINT `fk_detail_task` FOREIGN KEY (`task_id`) REFERENCES `detection_task`(`task_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_detail_class` FOREIGN KEY (`class_id`) REFERENCES `model_class`(`class_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='检测详情表';

-- ----------------------------
-- 6. 跟踪记录模块
-- ----------------------------

-- 跟踪记录表 (跟踪轨迹)
DROP TABLE IF EXISTS `tracking_record`;
CREATE TABLE `tracking_record` (
  `track_id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '跟踪记录ID',
  `task_id` BIGINT NOT NULL COMMENT '任务ID',
  `unique_track_id` INT NOT NULL COMMENT '唯一跟踪ID',

  -- 基本信息
  `class_id` BIGINT NOT NULL COMMENT '类别ID',
  `class_name` VARCHAR(50) NOT NULL COMMENT '类别名称',

  -- 时间范围
  `start_frame` INT DEFAULT NULL COMMENT '起始帧',
  `end_frame` INT DEFAULT NULL COMMENT '结束帧',
  `start_time` DECIMAL(10,3) DEFAULT NULL COMMENT '起始时间(秒)',
  `end_time` DECIMAL(10,3) DEFAULT NULL COMMENT '结束时间(秒)',
  `duration` DECIMAL(10,3) DEFAULT NULL COMMENT '持续时间(秒)',

  -- 统计
  `total_detections` INT DEFAULT 0 COMMENT '总检测次数',
  `avg_confidence` DECIMAL(5,4) DEFAULT NULL COMMENT '平均置信度',
  `max_confidence` DECIMAL(5,4) DEFAULT NULL COMMENT '最大置信度',

  -- 轨迹数据
  `path_coordinates` TEXT DEFAULT NULL COMMENT '路径坐标JSON [{"frame":n, "x":100, "y":200},...]',
  `bbox_history` TEXT DEFAULT NULL COMMENT '边界框历史JSON',

  -- 结束原因
  `is_complete` TINYINT(1) DEFAULT 0 COMMENT '是否完整跟踪',
  `end_reason` TINYINT DEFAULT NULL COMMENT '结束原因 0=video_end 1=object_lost 2=occlusion 3=out_of_frame',

  -- 审计字段
  `is_deleted` TINYINT(1) DEFAULT 0 COMMENT '删除标志',
  `created_by` BIGINT DEFAULT NULL COMMENT '创建人ID',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_by` BIGINT DEFAULT NULL COMMENT '更新人ID',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',

  PRIMARY KEY (`track_id`),
  UNIQUE KEY `uk_task_track` (`task_id`, `unique_track_id`),
  KEY `idx_class_name` (`class_name`),
  KEY `idx_duration` (`duration`),

  CONSTRAINT `fk_track_task` FOREIGN KEY (`task_id`) REFERENCES `detection_task`(`task_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_track_class` FOREIGN KEY (`class_id`) REFERENCES `model_class`(`class_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='跟踪记录表';

-- ----------------------------
-- 7. 告警和分析模块
-- ----------------------------

-- 告警记录表
DROP TABLE IF EXISTS `alert_record`;
CREATE TABLE `alert_record` (
  `alert_id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '告警ID',
  `task_id` BIGINT NOT NULL COMMENT '任务ID',

  -- 告警信息
  `alert_type` VARCHAR(50) NOT NULL COMMENT '告警类型',
  `alert_level` TINYINT NOT NULL COMMENT '告警级别 0=info 1=warning 2=error 3=critical',
  `alert_title` VARCHAR(200) NOT NULL COMMENT '告警标题',
  `alert_message` TEXT COMMENT '告警详细信息',

  -- 触发条件
  `trigger_field` VARCHAR(50) DEFAULT NULL COMMENT '触发字段',
  `trigger_value` VARCHAR(100) DEFAULT NULL COMMENT '触发值',
  `threshold_value` VARCHAR(100) DEFAULT NULL COMMENT '阈值',

  -- 快照
  `frame_index` INT DEFAULT NULL COMMENT '帧索引',
  `screenshot_url` VARCHAR(500) DEFAULT NULL COMMENT '截图URL',

  -- 处理状态
  `is_handled` TINYINT(1) DEFAULT 0 COMMENT '是否已处理',
  `handled_by` BIGINT DEFAULT NULL COMMENT '处理人ID',
  `handled_time` DATETIME DEFAULT NULL COMMENT '处理时间',
  `handle_note` TEXT COMMENT '处理备注',

  -- 审计字段
  `is_deleted` TINYINT(1) DEFAULT 0 COMMENT '删除标志',
  `created_by` BIGINT DEFAULT NULL COMMENT '创建人ID',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_by` BIGINT DEFAULT NULL COMMENT '更新人ID',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',

  PRIMARY KEY (`alert_id`),
  KEY `idx_task_id` (`task_id`),
  KEY `idx_alert_level` (`alert_level`),
  KEY `idx_is_handled` (`is_handled`),
  KEY `idx_create_time` (`create_time`),

  CONSTRAINT `fk_alert_task` FOREIGN KEY (`task_id`) REFERENCES `detection_task`(`task_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='告警记录表';

-- 行为分析表
DROP TABLE IF EXISTS `behavior_analysis`;
CREATE TABLE `behavior_analysis` (
  `analysis_id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '分析ID',
  `task_id` BIGINT NOT NULL COMMENT '任务ID',

  -- 分析信息
  `analysis_date` DATE DEFAULT NULL COMMENT '分析日期',
  `total_students` INT DEFAULT 0 COMMENT '总学生数',
  `total_frames` INT DEFAULT 0 COMMENT '总帧数',
  `total_detections` INT DEFAULT 0 COMMENT '总检测数',

  -- 分析结果
  `behavior_stats` JSON DEFAULT NULL COMMENT '行为统计JSON',
  `timeline_data` JSON DEFAULT NULL COMMENT '时间线数据JSON',
  `heatmap_data` JSON DEFAULT NULL COMMENT '热力图数据JSON',

  -- 关键指标
  `peak_time` VARCHAR(50) DEFAULT NULL COMMENT '高峰时间',
  `risk_level` TINYINT DEFAULT 0 COMMENT '风险等级 0=low 1=medium 2=high 3=critical',
  `analysis_summary` TEXT COMMENT '分析摘要',

  -- 告警
  `alert_triggered` TINYINT(1) DEFAULT 0 COMMENT '是否触发告警',

  -- 审计字段
  `is_deleted` TINYINT(1) DEFAULT 0 COMMENT '删除标志',
  `created_by` BIGINT DEFAULT NULL COMMENT '创建人ID',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_by` BIGINT DEFAULT NULL COMMENT '更新人ID',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',

  PRIMARY KEY (`analysis_id`),
  KEY `idx_task_id` (`task_id`),
  KEY `idx_analysis_date` (`analysis_date`),
  KEY `idx_risk_level` (`risk_level`),

  CONSTRAINT `fk_analysis_task` FOREIGN KEY (`task_id`) REFERENCES `detection_task`(`task_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='行为分析表';

-- ----------------------------
-- 索引优化建议
-- ----------------------------

-- 对于大数据量的 detection_detail 表，建议按时间分区
-- ALTER TABLE detection_detail PARTITION BY RANGE (YEAR(create_time)) (
--   PARTITION p2023 VALUES LESS THAN (2024),
--   PARTITION p2024 VALUES LESS THAN (2025),
--   PARTITION p2025 VALUES LESS THAN (2026),
--   PARTITION p2026 VALUES LESS THAN (2027),
--   PARTITION p_future VALUES LESS THAN MAXVALUE
-- );

-- ----------------------------
-- 初始化数据
-- ----------------------------

-- 插入默认模型配置
INSERT INTO `model_config` (
  `model_name`, `model_version`, `model_type`, `model_size`,
  `model_path`, `input_size`, `num_classes`, `is_default`, `is_active`,
  `description`, `created_by`
) VALUES (
  'ClassAI-8n', 'v1.0', 'yolov8', 'n',
  '/Users/dock4chips/Script-P/classai-edu/model/classai_8n.pt',
  640, 6, 1, 1,
  'ClassAI 默认 YOLOv8n 模型', 1
);

-- 插入模型类别
INSERT INTO `model_class` (`model_id`, `class_name`, `class_name_en`, `class_name_zh`, `class_index`, `description`, `created_by`) VALUES
(1, 'learning_to_copy', 'Learning to Copy', '试图抄袭', 0, '学生试图抄袭他人作业或答案', 1),
(1, 'looking_around', 'Looking Around', '东张西望', 1, '学生在课堂上东张西望，注意力不集中', 1),
(1, 'sharing_answers', 'Sharing Answers', '分享答案', 2, '学生与他人分享答案', 1),
(1, 'sleeping', 'Sleeping', '睡觉', 3, '学生在课堂上睡觉', 1),
(1, 'staff', 'Staff', '工作人员', 4, '教师或工作人员', 1),
(1, 'using_mobile', 'Using Mobile', '使用电子设备', 5, '学生在课堂上使用手机或其他电子设备', 1);

-- 插入绘图配置 (与 draw.py 中的颜色保持一致)
INSERT INTO `model_draw_config` (`model_id`, `class_id`, `color_name`, `color_hex`, `color_rgb`, `color_bgr`, `border_thickness`, `font_scale`, `font_thickness`, `text_color`, `display_label`, `display_confidence`, `display_box`, `is_default`, `created_by`) VALUES
(1, 1, '红色', '#FF0000', 'rgb(255, 0, 0)', '(0, 0, 255)', 2, 0.50, 1, '#FFFFFF', 1, 1, 1, 1, 1),
(1, 2, '黄色', '#FFFF00', 'rgb(255, 255, 0)', '(0, 255, 255)', 2, 0.50, 1, '#FFFFFF', 1, 1, 1, 1, 1),
(1, 3, '绿色', '#00FF00', 'rgb(0, 255, 0)', '(0, 255, 0)', 2, 0.50, 1, '#FFFFFF', 1, 1, 1, 1, 1),
(1, 4, '蓝色', '#0000FF', 'rgb(0, 0, 255)', '(255, 0, 0)', 2, 0.50, 1, '#FFFFFF', 1, 1, 1, 1, 1),
(1, 5, '紫色', '#FF00FF', 'rgb(255, 0, 255)', '(255, 0, 255)', 2, 0.50, 1, '#FFFFFF', 1, 1, 1, 1, 1),
(1, 6, '青色', '#00FFFF', 'rgb(0, 255, 255)', '(255, 255, 0)', 2, 0.50, 1, '#FFFFFF', 1, 1, 1, 1, 1);

SET FOREIGN_KEY_CHECKS = 1;

-- ========================================
-- 设计说明
-- ========================================
--
-- 1. 资源统一管理：
--    - 使用 resource 表统一管理图片、视频、批量资源
--    - 支持多种来源类型：upload/url/camera/rtsp
--
-- 2. 任务与结果分离：
--    - detection_task: 只存储任务配置和状态
--    - detection_summary: 任务级别的统计汇总
--    - detection_detail: 详细的检测数据
--    - detection_class_count: 类别级别的统计
--
-- 3. 设备管理：
--    - device 表管理摄像头、无人机等设备
--    - 支持多种连接方式：RTSP/HTTP/USB
--    - 设备状态管理和心跳检测
--
-- 4. 外键约束：
--    - 所有外键关系都建立了约束
--    - 级联删除策略合理配置
--
-- 5. 索引优化：
--    - 为常用查询字段添加索引
--    - 组合索引优化复杂查询
--
-- 6. 计算列：
--    - detection_detail 使用计算列自动计算中心点、尺寸、面积
--    - 避免应用层计算错误
--
-- 7. 类型安全：
--    - 使用 ENUM 约束取值范围
--    - 避免无效数据插入
--
-- 8. 分区建议：
--    - detection_detail 数据量大时按时间分区
--    - 提升查询和删除性能
-- ========================================