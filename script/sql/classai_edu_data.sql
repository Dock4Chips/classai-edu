/*
 Navicat Premium Dump SQL

 Source Server         : mysql_dev
 Source Server Type    : MySQL
 Source Server Version : 80034 (8.0.34)
 Source Host           : localhost:3306
 Source Schema         : classai_edu

 Target Server Type    : MySQL
 Target Server Version : 80034 (8.0.34)
 File Encoding         : 65001

 Date: 27/10/2026 17:25:09
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for class_index_banner
-- ----------------------------
DROP TABLE IF EXISTS `class_index_banner`;
CREATE TABLE `class_index_banner` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `resource_type` varchar(20) NOT NULL COMMENT '资源类型 image/video/frame',
  `resource_url` varchar(500) NOT NULL COMMENT '原始图片/视频URL',
  `width` int DEFAULT NULL COMMENT '宽度',
  `height` int DEFAULT NULL COMMENT '高度',
  `fps` decimal(5,2) DEFAULT NULL COMMENT '帧率(视频)',
  `model_id` bigint DEFAULT NULL COMMENT '模型ID',
  `model_name` varchar(100) DEFAULT NULL COMMENT '模型名称',
  `model_version` varchar(50) DEFAULT NULL COMMENT '模型版本',
  `conf_threshold` decimal(5,4) DEFAULT NULL COMMENT '置信度阈值',
  `iou_threshold` decimal(5,4) DEFAULT NULL COMMENT 'IOU阈值',
  `num_boxes` int NOT NULL DEFAULT '0' COMMENT '检测目标数量',
  `cls_counts` json DEFAULT NULL COMMENT '各类别数量统计',
  `max_confidence` decimal(5,4) DEFAULT NULL COMMENT '最高置信度',
  `det_list` json NOT NULL COMMENT '检测结果数组(det_list)',
  `raw_result` json NOT NULL COMMENT '模型原始返回(JSON)',
  `status` int DEFAULT '0' COMMENT '状态 success/failed/pending',
  `remark` varchar(500) DEFAULT NULL COMMENT '备注',
  `is_deleted` tinyint(1) DEFAULT '0' COMMENT '删除标志 0=未删除 1=已删除',
  `created_by` bigint DEFAULT NULL COMMENT '创建人ID',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_by` bigint DEFAULT NULL COMMENT '更新人ID',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `user_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  KEY `fk_banner_user` (`user_id`),
  CONSTRAINT `fk_banner_user` FOREIGN KEY (`user_id`) REFERENCES `sys_user` (`user_id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=40 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='AI检测结果表';

-- ----------------------------
-- Records of class_index_banner
-- ----------------------------
BEGIN;
COMMIT;

-- ----------------------------
-- Table structure for detection_class_count
-- ----------------------------
DROP TABLE IF EXISTS `detection_class_count`;
CREATE TABLE `detection_class_count` (
  `count_id` bigint NOT NULL AUTO_INCREMENT COMMENT '统计ID',
  `task_id` bigint NOT NULL COMMENT '任务ID',
  `class_id` bigint NOT NULL COMMENT '类别ID',
  `class_name` varchar(50) NOT NULL COMMENT '类别名称',
  `count` int DEFAULT '0' COMMENT '检测次数',
  `avg_confidence` decimal(5,4) DEFAULT NULL COMMENT '平均置信度',
  `max_confidence` decimal(5,4) DEFAULT NULL COMMENT '最大置信度',
  `min_confidence` decimal(5,4) DEFAULT NULL COMMENT '最小置信度',
  `duration_seconds` decimal(10,3) DEFAULT NULL COMMENT '持续时间(秒)',
  `percentage` decimal(5,2) DEFAULT NULL COMMENT '占比(%)',
  `created_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`count_id`),
  UNIQUE KEY `uk_task_class` (`task_id`,`class_id`),
  KEY `idx_class_name` (`class_name`),
  KEY `idx_count` (`count`),
  KEY `fk_class_count_class` (`class_id`),
  CONSTRAINT `fk_class_count_class` FOREIGN KEY (`class_id`) REFERENCES `model_class` (`class_id`),
  CONSTRAINT `fk_class_count_task` FOREIGN KEY (`task_id`) REFERENCES `detection_task` (`task_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=166 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='类别统计表';

-- ----------------------------
-- Records of detection_class_count
-- ----------------------------
BEGIN;
COMMIT;

-- ----------------------------
-- Table structure for detection_detail
-- ----------------------------
DROP TABLE IF EXISTS `detection_detail`;
CREATE TABLE `detection_detail` (
  `detail_id` bigint NOT NULL AUTO_INCREMENT COMMENT '详情ID',
  `task_id` bigint NOT NULL COMMENT '任务ID',
  `class_id` bigint NOT NULL COMMENT '类别ID',
  `class_name` varchar(50) NOT NULL COMMENT '类别名称',
  `class_index` int NOT NULL COMMENT '类别索引',
  `frame_index` int DEFAULT NULL COMMENT '帧索引',
  `timestamp_ms` bigint DEFAULT NULL COMMENT '时间戳(毫秒)',
  `confidence` decimal(5,4) NOT NULL COMMENT '置信度',
  `bbox_x1` decimal(10,2) NOT NULL COMMENT '边界框x1',
  `bbox_y1` decimal(10,2) NOT NULL COMMENT '边界框y1',
  `bbox_x2` decimal(10,2) NOT NULL COMMENT '边界框x2',
  `bbox_y2` decimal(10,2) NOT NULL COMMENT '边界框y2',
  `bbox_center_x` decimal(10,2) GENERATED ALWAYS AS (((`bbox_x1` + `bbox_x2`) / 2)) STORED COMMENT '中心点X',
  `bbox_center_y` decimal(10,2) GENERATED ALWAYS AS (((`bbox_y1` + `bbox_y2`) / 2)) STORED COMMENT '中心点Y',
  `bbox_width` decimal(10,2) GENERATED ALWAYS AS ((`bbox_x2` - `bbox_x1`)) STORED COMMENT '宽度',
  `bbox_height` decimal(10,2) GENERATED ALWAYS AS ((`bbox_y2` - `bbox_y1`)) STORED COMMENT '高度',
  `bbox_area` decimal(10,2) GENERATED ALWAYS AS (((`bbox_x2` - `bbox_x1`) * (`bbox_y2` - `bbox_y1`))) STORED COMMENT '面积',
  `draw_color` varchar(20) DEFAULT NULL COMMENT '绘制颜色',
  `detection_time` datetime DEFAULT NULL COMMENT '检测时间',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `user_id` bigint NOT NULL COMMENT '用户编码',
  `created_by` bigint DEFAULT NULL,
  `updated_by` bigint DEFAULT NULL,
  PRIMARY KEY (`detail_id`),
  KEY `idx_task_id` (`task_id`),
  KEY `idx_class_id` (`class_id`),
  KEY `idx_class_name` (`class_name`),
  KEY `idx_frame_index` (`frame_index`),
  KEY `idx_confidence` (`confidence`),
  KEY `idx_detection_time` (`detection_time`),
  KEY `idx_task_class` (`task_id`,`class_name`),
  KEY `fk_detail_user` (`user_id`),
  CONSTRAINT `fk_detail_class` FOREIGN KEY (`class_id`) REFERENCES `model_class` (`class_id`),
  CONSTRAINT `fk_detail_task` FOREIGN KEY (`task_id`) REFERENCES `detection_task` (`task_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_detail_user` FOREIGN KEY (`user_id`) REFERENCES `sys_user` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=196 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='检测详情表';

-- ----------------------------
-- Records of detection_detail
-- ----------------------------
BEGIN;
COMMIT;

-- ----------------------------
-- Table structure for detection_summary
-- ----------------------------
DROP TABLE IF EXISTS `detection_summary`;
CREATE TABLE `detection_summary` (
  `summary_id` bigint NOT NULL AUTO_INCREMENT COMMENT '汇总ID',
  `task_id` bigint NOT NULL COMMENT '任务ID',
  `total_detections` int DEFAULT '0' COMMENT '总检测数',
  `num_frames` int DEFAULT '0' COMMENT '检测帧数',
  `processing_time_ms` int DEFAULT NULL COMMENT '总处理时间(毫秒)',
  `avg_fps` decimal(5,2) DEFAULT NULL COMMENT '平均FPS',
  `avg_time_per_frame_ms` int DEFAULT NULL COMMENT '平均每帧处理时间(毫秒)',
  `annotated_video_url` varchar(500) DEFAULT NULL COMMENT '标注视频URL',
  `annotated_frames_url` varchar(500) DEFAULT NULL COMMENT '标注帧打包URL',
  `result_json_url` varchar(500) DEFAULT NULL COMMENT '结果JSON文件URL',
  `class_stats` json DEFAULT NULL COMMENT '各类别统计JSON',
  `created_by` bigint DEFAULT NULL COMMENT '创建人ID',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_by` bigint DEFAULT NULL COMMENT '更新人ID',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `user_id` bigint NOT NULL COMMENT '用户编码',
  PRIMARY KEY (`summary_id`),
  UNIQUE KEY `uk_task_summary` (`task_id`),
  KEY `idx_total_detections` (`total_detections`),
  KEY `fk_summary_user` (`user_id`),
  CONSTRAINT `fk_summary_task` FOREIGN KEY (`task_id`) REFERENCES `detection_task` (`task_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_summary_user` FOREIGN KEY (`user_id`) REFERENCES `sys_user` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='检测汇总表';

-- ----------------------------
-- Records of detection_summary
-- ----------------------------
BEGIN;
COMMIT;

-- ----------------------------
-- Table structure for detection_task
-- ----------------------------
DROP TABLE IF EXISTS `detection_task`;
CREATE TABLE `detection_task` (
  `task_id` bigint NOT NULL AUTO_INCREMENT COMMENT '任务ID',
  `task_name` varchar(200) NOT NULL COMMENT '任务名称',
  `task_type` tinyint NOT NULL COMMENT '任务类型 0=image 1=cap 2=stream 3=batch',
  `task_status` tinyint DEFAULT '0' COMMENT '任务状态 0=pending 1= running 2=failed 3= completed',
  `model_id` bigint NOT NULL COMMENT '使用的模型ID',
  `conf_threshold` decimal(5,4) DEFAULT '0.5000' COMMENT '置信度阈值',
  `iou_threshold` decimal(5,4) DEFAULT '0.4500' COMMENT 'IOU阈值',
  `enable_tracking` tinyint(1) DEFAULT '0' COMMENT '是否启用目标跟踪',
  `device_id` bigint DEFAULT NULL COMMENT '设备ID(实时流)',
  `output_path` longblob COMMENT '输出文件路径',
  `is_active` tinyint(1) DEFAULT '0' COMMENT '实时任务是否活跃',
  `total_frames` int DEFAULT '0' COMMENT '总帧数',
  `progress_pct` decimal(5,2) DEFAULT '0.00' COMMENT '进度百分比',
  `start_time` datetime DEFAULT NULL COMMENT '开始时间',
  `end_time` datetime DEFAULT NULL COMMENT '结束时间',
  `duration_seconds` int DEFAULT NULL COMMENT '耗时(秒)',
  `created_by` bigint DEFAULT NULL COMMENT '创建人ID',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_by` bigint DEFAULT NULL COMMENT '更新人ID',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `user_id` bigint NOT NULL,
  `is_deleted` tinyint DEFAULT '0',
  PRIMARY KEY (`task_id`,`user_id`) USING BTREE,
  KEY `idx_task_type_status` (`task_type`,`task_status`),
  KEY `idx_model_id` (`model_id`),
  KEY `idx_device_id` (`device_id`),
  KEY `idx_is_active` (`is_active`),
  KEY `idx_create_time` (`create_time`),
  KEY `task_id` (`task_id`),
  KEY `fk_task_user` (`user_id`),
  CONSTRAINT `fk_task_device` FOREIGN KEY (`device_id`) REFERENCES `device` (`device_id`) ON DELETE SET NULL,
  CONSTRAINT `fk_task_model` FOREIGN KEY (`model_id`) REFERENCES `model_config` (`model_id`),
  CONSTRAINT `fk_task_user` FOREIGN KEY (`user_id`) REFERENCES `sys_user` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=171 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='检测任务表';

-- ----------------------------
-- Records of detection_task
-- ----------------------------
BEGIN;
COMMIT;

-- ----------------------------
-- Table structure for device
-- ----------------------------
DROP TABLE IF EXISTS `device`;
CREATE TABLE `device` (
  `device_id` bigint NOT NULL AUTO_INCREMENT COMMENT '设备ID',
  `device_name` varchar(100) NOT NULL COMMENT '设备名称',
  `device_type` tinyint NOT NULL COMMENT '设备类型 0=camera 1=drone 2=ip_camera 3=usb_camera',
  `device_code` varchar(100) DEFAULT NULL COMMENT '设备编码',
  `connection_type` tinyint DEFAULT '0' COMMENT '连接类型 0=rtsp 1=http 2=usb 3=file',
  `rtsp_url` varchar(500) DEFAULT NULL COMMENT 'RTSP地址',
  `http_url` varchar(500) DEFAULT NULL COMMENT 'HTTP地址',
  `device_index` int DEFAULT NULL COMMENT '设备索引(USB摄像头)',
  `location` varchar(200) DEFAULT NULL COMMENT '安装位置',
  `resolution` varchar(20) DEFAULT '1920x1080' COMMENT '分辨率',
  `fps` int DEFAULT '25' COMMENT '帧率',
  `ptz_support` tinyint(1) DEFAULT '0' COMMENT '是否支持云台',
  `status` tinyint DEFAULT '1' COMMENT '设备状态 0=online 1=offline 2=error 3=maintenance',
  `last_heartbeat` datetime DEFAULT NULL COMMENT '最后心跳时间',
  `last_online_time` datetime DEFAULT NULL COMMENT '最后在线时间',
  `description` text COMMENT '描述',
  `is_enabled` tinyint(1) DEFAULT '1' COMMENT '是否启用',
  `is_deleted` tinyint(1) DEFAULT '0' COMMENT '删除标志',
  `user_id` bigint DEFAULT NULL COMMENT '所属用户ID',
  `created_by` bigint DEFAULT NULL COMMENT '创建人ID',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_by` bigint DEFAULT NULL COMMENT '更新人ID',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`device_id`),
  UNIQUE KEY `uk_device_code` (`device_code`),
  KEY `idx_device_type` (`device_type`),
  KEY `idx_status` (`status`),
  KEY `idx_is_enabled` (`is_enabled`),
  KEY `idx_device_user_id` (`user_id`),
  CONSTRAINT `fk_device_user` FOREIGN KEY (`user_id`) REFERENCES `sys_user` (`user_id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='设备表';

-- ----------------------------
-- Records of device
-- ----------------------------
BEGIN;
COMMIT;

-- ----------------------------
-- Table structure for model_class
-- ----------------------------
DROP TABLE IF EXISTS `model_class`;
CREATE TABLE `model_class` (
  `class_id` bigint NOT NULL AUTO_INCREMENT COMMENT '类别ID',
  `model_id` bigint NOT NULL COMMENT '所属模型ID',
  `class_name` varchar(50) NOT NULL COMMENT '类别名称(代码)',
  `class_name_en` varchar(50) NOT NULL COMMENT '英文名称',
  `class_name_zh` varchar(50) NOT NULL COMMENT '中文名称',
  `class_index` int NOT NULL COMMENT '类别索引(0-5)',
  `class_code` varchar(20) DEFAULT NULL COMMENT '类别代码',
  `description` text COMMENT '类别描述',
  `is_active` tinyint(1) DEFAULT '1' COMMENT '是否启用',
  `sort_order` int DEFAULT '0' COMMENT '排序',
  `is_deleted` tinyint(1) DEFAULT '0' COMMENT '删除标志',
  `user_id` bigint DEFAULT NULL COMMENT '所属用户ID',
  `created_by` bigint DEFAULT NULL COMMENT '创建人ID',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_by` bigint DEFAULT NULL COMMENT '更新人ID',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`class_id`),
  UNIQUE KEY `uk_model_class` (`model_id`,`class_index`),
  KEY `idx_class_name` (`class_name`),
  KEY `idx_model_class_user_id` (`user_id`),
  CONSTRAINT `fk_model_class_model` FOREIGN KEY (`model_id`) REFERENCES `model_config` (`model_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_model_class_user` FOREIGN KEY (`user_id`) REFERENCES `sys_user` (`user_id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='模型类别表';

-- ----------------------------
-- Records of model_class
-- ----------------------------
BEGIN;
INSERT INTO `model_class` (`class_id`, `model_id`, `class_name`, `class_name_en`, `class_name_zh`, `class_index`, `class_code`, `description`, `is_active`, `sort_order`, `is_deleted`, `user_id`, `created_by`, `create_time`, `updated_by`, `update_time`) VALUES (1, 1, 'learning_to_copy', 'Learning to Copy', '试图抄袭', 0, NULL, '学生试图抄袭他人作业或答案', 1, 0, 0, 1, 1, '2026-02-03 15:41:01', NULL, '2026-04-17 12:07:28');
INSERT INTO `model_class` (`class_id`, `model_id`, `class_name`, `class_name_en`, `class_name_zh`, `class_index`, `class_code`, `description`, `is_active`, `sort_order`, `is_deleted`, `user_id`, `created_by`, `create_time`, `updated_by`, `update_time`) VALUES (2, 1, 'looking_around', 'Looking Around', '东张西望', 1, NULL, '学生在课堂上东张西望，注意力不集中', 1, 0, 0, 1, 1, '2026-02-03 15:41:01', NULL, '2026-04-17 12:07:28');
INSERT INTO `model_class` (`class_id`, `model_id`, `class_name`, `class_name_en`, `class_name_zh`, `class_index`, `class_code`, `description`, `is_active`, `sort_order`, `is_deleted`, `user_id`, `created_by`, `create_time`, `updated_by`, `update_time`) VALUES (3, 1, 'sharing_answers', 'Sharing Answers', '分享答案', 2, NULL, '学生与他人分享答案', 1, 0, 0, 1, 1, '2026-02-03 15:41:01', NULL, '2026-04-17 12:07:28');
INSERT INTO `model_class` (`class_id`, `model_id`, `class_name`, `class_name_en`, `class_name_zh`, `class_index`, `class_code`, `description`, `is_active`, `sort_order`, `is_deleted`, `user_id`, `created_by`, `create_time`, `updated_by`, `update_time`) VALUES (4, 1, 'sleeping', 'Sleeping', '睡觉', 3, NULL, '学生在课堂上睡觉', 1, 0, 0, 1, 1, '2026-02-03 15:41:01', NULL, '2026-04-17 12:07:28');
INSERT INTO `model_class` (`class_id`, `model_id`, `class_name`, `class_name_en`, `class_name_zh`, `class_index`, `class_code`, `description`, `is_active`, `sort_order`, `is_deleted`, `user_id`, `created_by`, `create_time`, `updated_by`, `update_time`) VALUES (5, 1, 'staff', 'Staff', '工作人员', 4, NULL, '教师或工作人员', 1, 0, 0, 1, 1, '2026-02-03 15:41:01', NULL, '2026-04-17 12:07:28');
INSERT INTO `model_class` (`class_id`, `model_id`, `class_name`, `class_name_en`, `class_name_zh`, `class_index`, `class_code`, `description`, `is_active`, `sort_order`, `is_deleted`, `user_id`, `created_by`, `create_time`, `updated_by`, `update_time`) VALUES (6, 1, 'using_mobile', 'Using Mobile', '使用电子设备', 5, NULL, '学生在课堂上使用手机或其他电子设备', 1, 0, 0, 1, 1, '2026-02-03 15:41:01', NULL, '2026-04-17 12:07:28');
COMMIT;

-- ----------------------------
-- Table structure for model_config
-- ----------------------------
DROP TABLE IF EXISTS `model_config`;
CREATE TABLE `model_config` (
  `model_id` bigint NOT NULL AUTO_INCREMENT COMMENT '模型ID',
  `model_name` varchar(100) NOT NULL COMMENT '模型名称',
  `model_version` varchar(50) DEFAULT NULL COMMENT '模型版本',
  `model_type` varchar(50) DEFAULT 'yolov8' COMMENT '模型类型 yolov8/yolov11',
  `model_size` varchar(20) DEFAULT 'n' COMMENT '模型大小 n/s/m/l/x',
  `model_path` varchar(500) NOT NULL COMMENT '模型文件路径',
  `model_url` varchar(500) DEFAULT NULL COMMENT '模型下载地址',
  `model_size_mb` decimal(10,2) DEFAULT NULL COMMENT '模型文件大小(MB)',
  `input_size` int DEFAULT '640' COMMENT '输入图像尺寸',
  `num_classes` int DEFAULT '6' COMMENT '类别数量',
  `precision` varchar(20) DEFAULT 'fp32' COMMENT '精度类型 fp32/fp16/int8',
  `inference_time_ms` int DEFAULT NULL COMMENT '平均推理时间(毫秒)',
  `map50` decimal(5,4) DEFAULT NULL COMMENT 'mAP@50',
  `map50_95` decimal(5,4) DEFAULT NULL COMMENT 'mAP@50-95',
  `training_epochs` int DEFAULT NULL COMMENT '训练轮数',
  `training_dataset` varchar(255) DEFAULT NULL COMMENT '训练数据集',
  `is_default` tinyint(1) DEFAULT '0' COMMENT '是否默认模型',
  `is_active` tinyint(1) DEFAULT '1' COMMENT '是否启用',
  `description` text COMMENT '模型描述',
  `is_deleted` tinyint(1) DEFAULT '0' COMMENT '删除标志',
  `user_id` bigint DEFAULT NULL COMMENT '所属用户ID',
  `created_by` bigint DEFAULT NULL COMMENT '创建人ID',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_by` bigint DEFAULT NULL COMMENT '更新人ID',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`model_id`),
  UNIQUE KEY `uk_model_name` (`model_name`),
  KEY `idx_is_default` (`is_default`),
  KEY `idx_is_active` (`is_active`),
  KEY `idx_model_config_user_id` (`user_id`),
  CONSTRAINT `fk_model_config_user` FOREIGN KEY (`user_id`) REFERENCES `sys_user` (`user_id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='模型配置表';

-- ----------------------------
-- Records of model_config
-- ----------------------------
BEGIN;
INSERT INTO `model_config` (`model_id`, `model_name`, `model_version`, `model_type`, `model_size`, `model_path`, `model_url`, `model_size_mb`, `input_size`, `num_classes`, `precision`, `inference_time_ms`, `map50`, `map50_95`, `training_epochs`, `training_dataset`, `is_default`, `is_active`, `description`, `is_deleted`, `user_id`, `created_by`, `create_time`, `updated_by`, `update_time`) VALUES (1, 'YOLO-v8n', 'v3.0', 'yolov8', 'n', '/Users/dock4chips/code_workspace/script-P/classai-edu/model/classai_model_8n/weights/best.pt', NULL, 5.95, 640, 6, 'fp32', 124, 0.8256, 0.4029, 169, NULL, 1, 1, 'ClassAI-Edu 默认 YOLOv8 模型', 0, 1, 1, '2026-02-03 15:41:01', 1, '2026-04-17 14:27:02');
INSERT INTO `model_config` (`model_id`, `model_name`, `model_version`, `model_type`, `model_size`, `model_path`, `model_url`, `model_size_mb`, `input_size`, `num_classes`, `precision`, `inference_time_ms`, `map50`, `map50_95`, `training_epochs`, `training_dataset`, `is_default`, `is_active`, `description`, `is_deleted`, `user_id`, `created_by`, `create_time`, `updated_by`, `update_time`) VALUES (2, 'YOLO-v8s', 'v2.0', 'yolov8', 'n', '/Users/dock4chips/code_workspace/script-P/classai-edu/model/classai_model_8s/weights/best.pt', NULL, 21.47, NULL, 6, 'fp32', 256, 0.8042, 0.3941, 166, NULL, 0, 1, 'YOLO-v8s', 0, 1, 1, '2026-04-17 11:35:28', 1, '2026-04-17 14:31:06');
INSERT INTO `model_config` (`model_id`, `model_name`, `model_version`, `model_type`, `model_size`, `model_path`, `model_url`, `model_size_mb`, `input_size`, `num_classes`, `precision`, `inference_time_ms`, `map50`, `map50_95`, `training_epochs`, `training_dataset`, `is_default`, `is_active`, `description`, `is_deleted`, `user_id`, `created_by`, `create_time`, `updated_by`, `update_time`) VALUES (3, 'YOLO-v8m', 'v2.0', 'yolov8', 'n', '/Users/dock4chips/code_workspace/script-P/classai-edu/model/classai_model_8m/weights/best.pt', NULL, 49.61, 640, 6, 'fp32', 450, 0.7980, 0.3932, 149, NULL, 0, 1, NULL, 0, 5, 1, '2026-04-17 11:36:12', 1, '2026-04-17 14:25:04');
COMMIT;

-- ----------------------------
-- Table structure for model_draw_config
-- ----------------------------
DROP TABLE IF EXISTS `model_draw_config`;
CREATE TABLE `model_draw_config` (
  `config_id` bigint NOT NULL AUTO_INCREMENT COMMENT '配置ID',
  `model_id` bigint NOT NULL COMMENT '模型ID',
  `class_id` bigint NOT NULL COMMENT '类别ID',
  `color_name` varchar(50) DEFAULT NULL COMMENT '颜色名称',
  `color_hex` varchar(20) NOT NULL COMMENT '十六进制颜色 #FF0000',
  `color_rgb` varchar(30) DEFAULT NULL COMMENT 'RGB颜色 rgb(255,0,0)',
  `color_bgr` varchar(30) DEFAULT NULL COMMENT 'BGR颜色 (0,0,255) OpenCV格式',
  `border_thickness` int DEFAULT '2' COMMENT '边框粗细',
  `border_alpha` decimal(3,2) DEFAULT '0.80' COMMENT '边框透明度',
  `display_label` tinyint(1) DEFAULT '1' COMMENT '是否显示标签',
  `display_confidence` tinyint(1) DEFAULT '1' COMMENT '是否显示置信度',
  `font_scale` decimal(3,2) DEFAULT '0.50' COMMENT '字体大小',
  `font_thickness` int DEFAULT '1' COMMENT '字体粗细',
  `text_color` varchar(20) DEFAULT '#FFFFFF' COMMENT '文本颜色',
  `background_color` varchar(20) DEFAULT NULL COMMENT '背景颜色',
  `display_box` tinyint(1) DEFAULT '1' COMMENT '是否显示边框',
  `box_fill` tinyint(1) DEFAULT '0' COMMENT '是否填充边框',
  `is_default` tinyint(1) DEFAULT '0' COMMENT '是否默认配置',
  `is_deleted` tinyint(1) DEFAULT '0' COMMENT '删除标志',
  `user_id` bigint DEFAULT NULL COMMENT '所属用户ID',
  `created_by` bigint DEFAULT NULL COMMENT '创建人ID',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_by` bigint DEFAULT NULL COMMENT '更新人ID',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`config_id`),
  UNIQUE KEY `uk_model_class_draw` (`model_id`,`class_id`),
  KEY `idx_class_id` (`class_id`),
  KEY `idx_model_draw_config_user_id` (`user_id`),
  CONSTRAINT `fk_draw_config_class` FOREIGN KEY (`class_id`) REFERENCES `model_class` (`class_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_draw_config_model` FOREIGN KEY (`model_id`) REFERENCES `model_config` (`model_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_model_draw_config_user` FOREIGN KEY (`user_id`) REFERENCES `sys_user` (`user_id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='模型绘图配置表';

-- ----------------------------
-- Records of model_draw_config
-- ----------------------------
BEGIN;
INSERT INTO `model_draw_config` (`config_id`, `model_id`, `class_id`, `color_name`, `color_hex`, `color_rgb`, `color_bgr`, `border_thickness`, `border_alpha`, `display_label`, `display_confidence`, `font_scale`, `font_thickness`, `text_color`, `background_color`, `display_box`, `box_fill`, `is_default`, `is_deleted`, `user_id`, `created_by`, `create_time`, `updated_by`, `update_time`) VALUES (1, 1, 1, '红色', '#FF0000', 'rgb(255, 0, 0)', '(0, 0, 255)', 2, 0.80, 1, 1, 0.50, 1, '#FFFFFF', NULL, 1, 0, 1, 0, 1, 1, '2026-02-03 15:41:01', NULL, '2026-04-17 12:07:28');
INSERT INTO `model_draw_config` (`config_id`, `model_id`, `class_id`, `color_name`, `color_hex`, `color_rgb`, `color_bgr`, `border_thickness`, `border_alpha`, `display_label`, `display_confidence`, `font_scale`, `font_thickness`, `text_color`, `background_color`, `display_box`, `box_fill`, `is_default`, `is_deleted`, `user_id`, `created_by`, `create_time`, `updated_by`, `update_time`) VALUES (2, 1, 2, '黄色', '#FFFF00', 'rgb(255, 255, 0)', '(0, 255, 255)', 2, 0.80, 1, 1, 0.50, 1, '#FFFFFF', NULL, 1, 0, 1, 0, 1, 1, '2026-02-03 15:41:01', NULL, '2026-04-17 12:07:28');
INSERT INTO `model_draw_config` (`config_id`, `model_id`, `class_id`, `color_name`, `color_hex`, `color_rgb`, `color_bgr`, `border_thickness`, `border_alpha`, `display_label`, `display_confidence`, `font_scale`, `font_thickness`, `text_color`, `background_color`, `display_box`, `box_fill`, `is_default`, `is_deleted`, `user_id`, `created_by`, `create_time`, `updated_by`, `update_time`) VALUES (3, 1, 3, '绿色', '#00FF00', 'rgb(0, 255, 0)', '(0, 255, 0)', 2, 0.80, 1, 1, 0.50, 1, '#FFFFFF', NULL, 1, 0, 1, 0, 1, 1, '2026-02-03 15:41:01', NULL, '2026-04-17 12:07:28');
INSERT INTO `model_draw_config` (`config_id`, `model_id`, `class_id`, `color_name`, `color_hex`, `color_rgb`, `color_bgr`, `border_thickness`, `border_alpha`, `display_label`, `display_confidence`, `font_scale`, `font_thickness`, `text_color`, `background_color`, `display_box`, `box_fill`, `is_default`, `is_deleted`, `user_id`, `created_by`, `create_time`, `updated_by`, `update_time`) VALUES (4, 1, 4, '蓝色', '#0000FF', 'rgb(0, 0, 255)', '(255, 0, 0)', 2, 0.80, 1, 1, 0.50, 1, '#FFFFFF', NULL, 1, 0, 1, 0, 1, 1, '2026-02-03 15:41:01', NULL, '2026-04-17 12:07:28');
INSERT INTO `model_draw_config` (`config_id`, `model_id`, `class_id`, `color_name`, `color_hex`, `color_rgb`, `color_bgr`, `border_thickness`, `border_alpha`, `display_label`, `display_confidence`, `font_scale`, `font_thickness`, `text_color`, `background_color`, `display_box`, `box_fill`, `is_default`, `is_deleted`, `user_id`, `created_by`, `create_time`, `updated_by`, `update_time`) VALUES (5, 1, 5, '紫色', '#FF00FF', 'rgb(255, 0, 255)', '(255, 0, 255)', 2, 0.80, 1, 1, 0.50, 1, '#FFFFFF', NULL, 1, 0, 1, 0, 1, 1, '2026-02-03 15:41:01', NULL, '2026-04-17 12:07:28');
INSERT INTO `model_draw_config` (`config_id`, `model_id`, `class_id`, `color_name`, `color_hex`, `color_rgb`, `color_bgr`, `border_thickness`, `border_alpha`, `display_label`, `display_confidence`, `font_scale`, `font_thickness`, `text_color`, `background_color`, `display_box`, `box_fill`, `is_default`, `is_deleted`, `user_id`, `created_by`, `create_time`, `updated_by`, `update_time`) VALUES (6, 1, 6, '青色', '#00FFFF', 'rgb(0, 255, 255)', '(255, 255, 0)', 2, 0.80, 1, 1, 0.50, 1, '#FFFFFF', NULL, 1, 0, 1, 0, 1, 1, '2026-02-03 15:41:01', NULL, '2026-04-17 12:07:28');
COMMIT;

-- ----------------------------
-- Table structure for sys_config
-- ----------------------------
DROP TABLE IF EXISTS `sys_config`;
CREATE TABLE `sys_config` (
  `config_id` bigint NOT NULL AUTO_INCREMENT COMMENT '配置ID',
  `config_name` varchar(100) NOT NULL COMMENT '配置名称',
  `config_key` varchar(100) NOT NULL COMMENT '配置键',
  `config_value` text COMMENT '配置值',
  `config_type` varchar(50) DEFAULT 'string' COMMENT '配置类型 string/number/boolean/json',
  `is_system` tinyint(1) DEFAULT '0' COMMENT '是否系统配置',
  `is_sensitive` tinyint(1) DEFAULT '0' COMMENT '是否敏感信息',
  `description` text COMMENT '描述',
  `group_name` varchar(50) DEFAULT NULL COMMENT '分组名称',
  `sort_order` int DEFAULT '0' COMMENT '排序',
  `is_deleted` tinyint(1) DEFAULT '0' COMMENT '删除标志',
  `created_by` bigint DEFAULT NULL COMMENT '创建人ID',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_by` bigint DEFAULT NULL COMMENT '更新人ID',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`config_id`),
  UNIQUE KEY `uk_config_key` (`config_key`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='系统配置表';

-- ----------------------------
-- Records of sys_config
-- ----------------------------
BEGIN;
INSERT INTO `sys_config` (`config_id`, `config_name`, `config_key`, `config_value`, `config_type`, `is_system`, `is_sensitive`, `description`, `group_name`, `sort_order`, `is_deleted`, `created_by`, `create_time`, `updated_by`, `update_time`) VALUES (1, '默认模型ID', 'default.model.id', '1', 'number', 0, 0, '系统默认使用的YOLO模型ID', 'model', 0, 0, 1, '2026-04-16 09:14:43', NULL, '2026-04-16 09:14:43');
INSERT INTO `sys_config` (`config_id`, `config_name`, `config_key`, `config_value`, `config_type`, `is_system`, `is_sensitive`, `description`, `group_name`, `sort_order`, `is_deleted`, `created_by`, `create_time`, `updated_by`, `update_time`) VALUES (2, '默认置信度阈值', 'default.conf.threshold', '0.5', 'number', 0, 0, '默认检测置信度阈值', 'detection', 0, 0, 1, '2026-04-16 09:14:43', NULL, '2026-04-16 09:14:43');
INSERT INTO `sys_config` (`config_id`, `config_name`, `config_key`, `config_value`, `config_type`, `is_system`, `is_sensitive`, `description`, `group_name`, `sort_order`, `is_deleted`, `created_by`, `create_time`, `updated_by`, `update_time`) VALUES (3, '默认IOU阈值', 'default.iou.threshold', '0.45', 'number', 0, 0, '默认NMS IOU阈值', 'detection', 0, 0, 1, '2026-04-16 09:14:43', NULL, '2026-04-16 09:14:43');
INSERT INTO `sys_config` (`config_id`, `config_name`, `config_key`, `config_value`, `config_type`, `is_system`, `is_sensitive`, `description`, `group_name`, `sort_order`, `is_deleted`, `created_by`, `create_time`, `updated_by`, `update_time`) VALUES (4, '视频保存路径', 'cap.save.path', '/data/cap', 'string', 0, 0, '检测结果视频保存路径', 'storage', 0, 0, 1, '2026-04-16 09:14:43', NULL, '2026-04-16 09:14:43');
INSERT INTO `sys_config` (`config_id`, `config_name`, `config_key`, `config_value`, `config_type`, `is_system`, `is_sensitive`, `description`, `group_name`, `sort_order`, `is_deleted`, `created_by`, `create_time`, `updated_by`, `update_time`) VALUES (5, '图片保存路径', 'image.save.path', '/data/images', 'string', 0, 0, '检测结果图片保存路径', 'storage', 0, 0, 1, '2026-04-16 09:14:43', NULL, '2026-04-16 09:14:43');
INSERT INTO `sys_config` (`config_id`, `config_name`, `config_key`, `config_value`, `config_type`, `is_system`, `is_sensitive`, `description`, `group_name`, `sort_order`, `is_deleted`, `created_by`, `create_time`, `updated_by`, `update_time`) VALUES (6, '最大文件大小', 'max.file.size.mb', '500', 'number', 0, 0, '最大上传文件大小(MB)', 'upload', 0, 0, 1, '2026-04-16 09:14:43', NULL, '2026-04-16 09:14:43');
INSERT INTO `sys_config` (`config_id`, `config_name`, `config_key`, `config_value`, `config_type`, `is_system`, `is_sensitive`, `description`, `group_name`, `sort_order`, `is_deleted`, `created_by`, `create_time`, `updated_by`, `update_time`) VALUES (7, '允许的文件格式', 'allowed.file.types', 'mp4,avi,jpg,jpeg,png', 'string', 0, 0, '允许上传的文件格式', 'upload', 0, 0, 1, '2026-04-16 09:14:43', NULL, '2026-04-16 09:14:43');
INSERT INTO `sys_config` (`config_id`, `config_name`, `config_key`, `config_value`, `config_type`, `is_system`, `is_sensitive`, `description`, `group_name`, `sort_order`, `is_deleted`, `created_by`, `create_time`, `updated_by`, `update_time`) VALUES (8, '告警启用状态', 'alert.enabled', 'true', 'boolean', 0, 0, '是否启用告警功能', 'alert', 0, 0, 1, '2026-04-16 09:14:43', NULL, '2026-04-16 09:14:43');
INSERT INTO `sys_config` (`config_id`, `config_name`, `config_key`, `config_value`, `config_type`, `is_system`, `is_sensitive`, `description`, `group_name`, `sort_order`, `is_deleted`, `created_by`, `create_time`, `updated_by`, `update_time`) VALUES (9, '低风险阈值', 'alert.low.threshold', '30', 'number', 0, 0, '低风险阈值(%)', 'alert', 0, 0, 1, '2026-04-16 09:14:43', NULL, '2026-04-16 09:14:43');
INSERT INTO `sys_config` (`config_id`, `config_name`, `config_key`, `config_value`, `config_type`, `is_system`, `is_sensitive`, `description`, `group_name`, `sort_order`, `is_deleted`, `created_by`, `create_time`, `updated_by`, `update_time`) VALUES (10, '高风险阈值', 'alert.high.threshold', '70', 'number', 0, 0, '高风险阈值(%)', 'alert', 0, 0, 1, '2026-04-16 09:14:43', NULL, '2026-04-16 09:14:43');
INSERT INTO `sys_config` (`config_id`, `config_name`, `config_key`, `config_value`, `config_type`, `is_system`, `is_sensitive`, `description`, `group_name`, `sort_order`, `is_deleted`, `created_by`, `create_time`, `updated_by`, `update_time`) VALUES (11, '系统名称', 'system.name', 'ClassAI-Edu', 'string', 0, 0, '系统名称', 'system', 0, 0, 1, '2026-04-16 09:14:43', NULL, '2026-04-16 09:21:46');
INSERT INTO `sys_config` (`config_id`, `config_name`, `config_key`, `config_value`, `config_type`, `is_system`, `is_sensitive`, `description`, `group_name`, `sort_order`, `is_deleted`, `created_by`, `create_time`, `updated_by`, `update_time`) VALUES (12, '系统版本', 'system.version', '1.0.0', 'string', 0, 0, '系统版本号', 'system', 0, 0, 1, '2026-04-16 09:14:43', NULL, '2026-04-16 09:14:43');
INSERT INTO `sys_config` (`config_id`, `config_name`, `config_key`, `config_value`, `config_type`, `is_system`, `is_sensitive`, `description`, `group_name`, `sort_order`, `is_deleted`, `created_by`, `create_time`, `updated_by`, `update_time`) VALUES (13, '系统网址', 'system.url', 'https://github.com/Dock4Chips/classai-edu', 'string', 0, 0, '系统访问地址', 'system', 0, 0, 1, '2026-04-16 09:14:43', NULL, '2026-04-16 10:01:52');
INSERT INTO `sys_config` (`config_id`, `config_name`, `config_key`, `config_value`, `config_type`, `is_system`, `is_sensitive`, `description`, `group_name`, `sort_order`, `is_deleted`, `created_by`, `create_time`, `updated_by`, `update_time`) VALUES (14, '维护模式', 'system.maintenance_mode', 'false', 'boolean', 0, 0, '是否开启维护模式', 'system', 0, 0, 1, '2026-04-16 09:14:43', NULL, '2026-04-16 09:29:42');
INSERT INTO `sys_config` (`config_id`, `config_name`, `config_key`, `config_value`, `config_type`, `is_system`, `is_sensitive`, `description`, `group_name`, `sort_order`, `is_deleted`, `created_by`, `create_time`, `updated_by`, `update_time`) VALUES (15, '密码复杂度', 'security.password.complexity', 'false', 'boolean', 0, 0, '是否启用密码复杂度校验', 'security', 0, 0, 1, '2026-04-16 09:14:43', NULL, '2026-04-26 17:12:38');
INSERT INTO `sys_config` (`config_id`, `config_name`, `config_key`, `config_value`, `config_type`, `is_system`, `is_sensitive`, `description`, `group_name`, `sort_order`, `is_deleted`, `created_by`, `create_time`, `updated_by`, `update_time`) VALUES (16, '双重认证', 'security.two_factor_auth', 'false', 'boolean', 0, 0, '是否启用双重认证', 'security', 0, 0, 1, '2026-04-16 09:14:43', NULL, '2026-04-16 09:14:43');
INSERT INTO `sys_config` (`config_id`, `config_name`, `config_key`, `config_value`, `config_type`, `is_system`, `is_sensitive`, `description`, `group_name`, `sort_order`, `is_deleted`, `created_by`, `create_time`, `updated_by`, `update_time`) VALUES (17, '邮件通知', 'notify.email.enabled', 'true', 'boolean', 0, 0, '是否启用邮件通知', 'notify', 0, 0, 1, '2026-04-16 09:14:43', NULL, '2026-04-16 11:36:04');
INSERT INTO `sys_config` (`config_id`, `config_name`, `config_key`, `config_value`, `config_type`, `is_system`, `is_sensitive`, `description`, `group_name`, `sort_order`, `is_deleted`, `created_by`, `create_time`, `updated_by`, `update_time`) VALUES (18, '登录警报', 'notify.login_alert.enabled', 'true', 'boolean', 0, 0, '是否启用登录警报', 'notify', 0, 0, 1, '2026-04-16 09:14:43', NULL, '2026-04-16 09:14:43');
INSERT INTO `sys_config` (`config_id`, `config_name`, `config_key`, `config_value`, `config_type`, `is_system`, `is_sensitive`, `description`, `group_name`, `sort_order`, `is_deleted`, `created_by`, `create_time`, `updated_by`, `update_time`) VALUES (19, '允许注册', 'auth.allow_registration', 'true', 'boolean', 0, 0, '是否允许公开注册', 'auth', 0, 0, 1, '2026-04-16 09:14:43', NULL, '2026-04-16 11:37:35');
INSERT INTO `sys_config` (`config_id`, `config_name`, `config_key`, `config_value`, `config_type`, `is_system`, `is_sensitive`, `description`, `group_name`, `sort_order`, `is_deleted`, `created_by`, `create_time`, `updated_by`, `update_time`) VALUES (20, '系统Logo地址', 'system.logo_url', 'http://127.0.0.1:9000/classai-edu/2026/04/16/723de3806c2e4a6da401417748dd10b4.png', 'string', 0, 0, NULL, 'system', 0, 0, NULL, '2026-04-16 18:14:19', NULL, '2026-04-16 11:39:39');
COMMIT;

-- ----------------------------
-- Table structure for sys_dict_data
-- ----------------------------
DROP TABLE IF EXISTS `sys_dict_data`;
CREATE TABLE `sys_dict_data` (
  `dict_code` bigint NOT NULL AUTO_INCREMENT COMMENT '字典编码',
  `dict_type` varchar(100) NOT NULL COMMENT '字典类型',
  `dict_label` varchar(100) NOT NULL COMMENT '字典标签',
  `dict_value` varchar(100) NOT NULL COMMENT '字典键值',
  `css_class` varchar(100) DEFAULT NULL COMMENT '样式属性',
  `list_class` varchar(100) DEFAULT NULL COMMENT '表格回显样式',
  `is_default` tinyint(1) DEFAULT '0' COMMENT '是否默认',
  `sort_order` int DEFAULT '0' COMMENT '排序',
  `status` char(1) DEFAULT '0' COMMENT '状态 0=正常 1=停用',
  `is_deleted` tinyint(1) DEFAULT '0' COMMENT '删除标志',
  `created_by` bigint DEFAULT NULL COMMENT '创建人ID',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_by` bigint DEFAULT NULL COMMENT '更新人ID',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`dict_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='字典数据表';

-- ----------------------------
-- Records of sys_dict_data
-- ----------------------------
BEGIN;
COMMIT;

-- ----------------------------
-- Table structure for sys_dict_type
-- ----------------------------
DROP TABLE IF EXISTS `sys_dict_type`;
CREATE TABLE `sys_dict_type` (
  `dict_id` bigint NOT NULL AUTO_INCREMENT COMMENT '字典ID',
  `dict_name` varchar(100) NOT NULL COMMENT '字典名称',
  `dict_type` varchar(100) NOT NULL COMMENT '字典类型',
  `status` char(1) DEFAULT '0' COMMENT '状态 0=正常 1=停用',
  `description` text COMMENT '描述',
  `is_deleted` tinyint(1) DEFAULT '0' COMMENT '删除标志',
  `created_by` bigint DEFAULT NULL COMMENT '创建人ID',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_by` bigint DEFAULT NULL COMMENT '更新人ID',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`dict_id`),
  UNIQUE KEY `uk_dict_type` (`dict_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='字典类型表';

-- ----------------------------
-- Records of sys_dict_type
-- ----------------------------
BEGIN;
COMMIT;

-- ----------------------------
-- Table structure for sys_job
-- ----------------------------
DROP TABLE IF EXISTS `sys_job`;
CREATE TABLE `sys_job` (
  `job_id` bigint NOT NULL AUTO_INCREMENT COMMENT '任务ID',
  `job_name` varchar(100) NOT NULL COMMENT '任务名称',
  `job_group` varchar(100) DEFAULT NULL COMMENT '任务组名',
  `invoke_target` varchar(500) NOT NULL COMMENT '调用目标字符串',
  `cron_expression` varchar(100) DEFAULT '' COMMENT 'cron执行表达式',
  `misfire_policy` varchar(20) DEFAULT '3' COMMENT '计划执行错误策略 1=立即执行 2=执行一次 3=放弃执行',
  `concurrent` char(1) DEFAULT '1' COMMENT '是否并发执行 0=允许 1=禁止',
  `status` char(1) DEFAULT '0' COMMENT '状态 0=正常 1=暂停',
  `remark` varchar(500) DEFAULT NULL COMMENT '备注信息',
  `is_deleted` tinyint(1) DEFAULT '0' COMMENT '删除标志',
  `created_by` bigint DEFAULT NULL COMMENT '创建人ID',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_by` bigint DEFAULT NULL COMMENT '更新人ID',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`job_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='定时任务表';

-- ----------------------------
-- Records of sys_job
-- ----------------------------
BEGIN;
COMMIT;

-- ----------------------------
-- Table structure for sys_job_log
-- ----------------------------
DROP TABLE IF EXISTS `sys_job_log`;
CREATE TABLE `sys_job_log` (
  `job_log_id` bigint NOT NULL AUTO_INCREMENT COMMENT '任务日志ID',
  `job_id` bigint NOT NULL COMMENT '任务ID',
  `job_name` varchar(100) NOT NULL COMMENT '任务名称',
  `job_group` varchar(100) DEFAULT NULL COMMENT '任务组名',
  `invoke_target` varchar(500) NOT NULL COMMENT '调用目标字符串',
  `job_message` text COMMENT '日志信息',
  `status` char(1) DEFAULT '0' COMMENT '执行状态 0=成功 1=失败',
  `exception_info` text COMMENT '异常信息',
  `created_by` bigint DEFAULT NULL COMMENT '创建人ID',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_by` bigint DEFAULT NULL COMMENT '更新人ID',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`job_log_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='定时任务执行日志表';

-- ----------------------------
-- Records of sys_job_log
-- ----------------------------
BEGIN;
COMMIT;

-- ----------------------------
-- Table structure for sys_login_log
-- ----------------------------
DROP TABLE IF EXISTS `sys_login_log`;
CREATE TABLE `sys_login_log` (
  `login_id` bigint NOT NULL AUTO_INCREMENT COMMENT '访问ID',
  `user_name` varchar(50) DEFAULT '' COMMENT '用户账号',
  `ipaddr` varchar(128) DEFAULT '' COMMENT '登录IP地址',
  `login_location` varchar(255) DEFAULT '' COMMENT '登录地点',
  `browser` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT '' COMMENT '浏览器类型',
  `os` varchar(50) DEFAULT '' COMMENT '操作系统',
  `status` char(1) DEFAULT '0' COMMENT '登录状态 0=成功 1=失败',
  `msg` varchar(255) DEFAULT '' COMMENT '提示消息',
  `login_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '访问时间',
  `created_by` bigint DEFAULT NULL COMMENT '创建人ID',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_by` bigint DEFAULT NULL COMMENT '更新人ID',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`login_id`)
) ENGINE=InnoDB AUTO_INCREMENT=131 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='登录日志表';

-- ----------------------------
-- Records of sys_login_log
-- ----------------------------
BEGIN;
COMMIT;

-- ----------------------------
-- Table structure for sys_menu
-- ----------------------------
DROP TABLE IF EXISTS `sys_menu`;
CREATE TABLE `sys_menu` (
  `menu_id` bigint NOT NULL AUTO_INCREMENT COMMENT '菜单ID',
  `menu_name` varchar(50) NOT NULL COMMENT '菜单名称',
  `parent_id` bigint DEFAULT '0' COMMENT '父菜单ID 0=顶级菜单',
  `order_num` int DEFAULT '0' COMMENT '显示顺序',
  `path` varchar(200) DEFAULT '' COMMENT '路由地址',
  `menu_type` char(1) DEFAULT '' COMMENT '菜单类型 M=目录 C=菜单 F=按钮',
  `menu_key` varchar(100) DEFAULT NULL COMMENT '菜单标识(用于权限匹配)',
  `icon` varchar(100) DEFAULT '#' COMMENT '菜单图标',
  `status` tinyint DEFAULT '0' COMMENT '菜单状态 0=正常 1=停用',
  `is_visible` tinyint(1) DEFAULT '1' COMMENT '是否显示 0=隐藏 1=显示',
  `is_deleted` tinyint(1) DEFAULT '0' COMMENT '删除标志 0=未删除 1=已删除',
  `user_id` bigint DEFAULT NULL COMMENT '所属用户ID',
  `created_by` bigint DEFAULT NULL COMMENT '创建人ID',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_by` bigint DEFAULT NULL COMMENT '更新人ID',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `remark` varchar(500) DEFAULT '' COMMENT '备注',
  PRIMARY KEY (`menu_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_parent_id` (`parent_id`),
  KEY `idx_menu_key` (`menu_key`),
  CONSTRAINT `fk_menu_user` FOREIGN KEY (`user_id`) REFERENCES `sys_user` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=129 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='菜单权限表';

-- ----------------------------
-- Records of sys_menu
-- ----------------------------
BEGIN;
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `menu_type`, `menu_key`, `icon`, `status`, `is_visible`, `is_deleted`, `user_id`, `created_by`, `create_time`, `updated_by`, `update_time`, `remark`) VALUES (1, 'Dashboard', 0, 1, '/admin/dashboard', 'C', 'dashboard', 'LayoutDashboard', 0, 1, 0, NULL, NULL, '2026-02-27 15:26:24', 1, '2026-05-10 03:43:30', '仪表板');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `menu_type`, `menu_key`, `icon`, `status`, `is_visible`, `is_deleted`, `user_id`, `created_by`, `create_time`, `updated_by`, `update_time`, `remark`) VALUES (2, 'Users', 0, 2, '/admin/users', 'C', 'users', 'Users', 0, 1, 0, NULL, NULL, '2026-02-27 15:26:24', NULL, '2026-02-27 15:26:24', '用户管理');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `menu_type`, `menu_key`, `icon`, `status`, `is_visible`, `is_deleted`, `user_id`, `created_by`, `create_time`, `updated_by`, `update_time`, `remark`) VALUES (3, 'Roles', 0, 3, '/admin/roles', 'C', 'roles', 'Shield', 0, 1, 0, NULL, NULL, '2026-02-27 15:26:24', NULL, '2026-02-27 15:26:24', '角色管理');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `menu_type`, `menu_key`, `icon`, `status`, `is_visible`, `is_deleted`, `user_id`, `created_by`, `create_time`, `updated_by`, `update_time`, `remark`) VALUES (4, 'Menus', 0, 4, '/admin/menus', 'C', 'menus', 'ListTree', 0, 1, 0, NULL, NULL, '2026-02-27 15:26:24', NULL, '2026-02-27 15:26:24', '菜单管理');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `menu_type`, `menu_key`, `icon`, `status`, `is_visible`, `is_deleted`, `user_id`, `created_by`, `create_time`, `updated_by`, `update_time`, `remark`) VALUES (5, 'Devices', 0, 5, '/admin/devices', 'C', 'devices', 'Camera', 0, 1, 0, NULL, NULL, '2026-02-27 15:26:24', NULL, '2026-02-27 15:26:24', '设备管理');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `menu_type`, `menu_key`, `icon`, `status`, `is_visible`, `is_deleted`, `user_id`, `created_by`, `create_time`, `updated_by`, `update_time`, `remark`) VALUES (6, 'Models', 0, 6, '/admin/models', 'C', 'models', 'BrainCircuit', 0, 1, 0, NULL, NULL, '2026-02-27 15:26:24', NULL, '2026-02-27 15:26:24', '模型管理');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `menu_type`, `menu_key`, `icon`, `status`, `is_visible`, `is_deleted`, `user_id`, `created_by`, `create_time`, `updated_by`, `update_time`, `remark`) VALUES (7, 'Banners', 0, 7, '/admin/banners', 'C', 'banners', 'ImageIcon', 0, 1, 0, NULL, NULL, '2026-02-27 15:26:24', NULL, '2026-02-27 15:26:24', '横幅管理');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `menu_type`, `menu_key`, `icon`, `status`, `is_visible`, `is_deleted`, `user_id`, `created_by`, `create_time`, `updated_by`, `update_time`, `remark`) VALUES (8, 'Settings', 0, 8, '/admin/settings', 'M', 'settings_dir', 'Settings', 0, 1, 0, NULL, NULL, '2026-02-27 15:26:24', 1, '2026-04-17 09:14:34', '系统设置（目录，不显示）');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `menu_type`, `menu_key`, `icon`, `status`, `is_visible`, `is_deleted`, `user_id`, `created_by`, `create_time`, `updated_by`, `update_time`, `remark`) VALUES (9, 'Settings Overview', 8, 0, '/admin/settings', 'C', 'settings_overview', 'Settings', 0, 1, 0, NULL, NULL, '2026-02-27 15:26:24', NULL, '2026-04-17 09:14:34', '设置总览');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `menu_type`, `menu_key`, `icon`, `status`, `is_visible`, `is_deleted`, `user_id`, `created_by`, `create_time`, `updated_by`, `update_time`, `remark`) VALUES (10, 'Notices', 8, 1, '/admin/settings/notices', 'C', 'notices', 'Bell', 0, 1, 0, NULL, NULL, '2026-02-27 15:26:24', NULL, '2026-02-27 15:26:24', '通知管理');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `menu_type`, `menu_key`, `icon`, `status`, `is_visible`, `is_deleted`, `user_id`, `created_by`, `create_time`, `updated_by`, `update_time`, `remark`) VALUES (11, 'Monitor', 8, 2, '/admin/settings/monitor', 'C', 'monitor', 'Activity', 0, 1, 0, NULL, NULL, '2026-02-27 15:26:24', NULL, '2026-02-27 15:26:24', '系统监控');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `menu_type`, `menu_key`, `icon`, `status`, `is_visible`, `is_deleted`, `user_id`, `created_by`, `create_time`, `updated_by`, `update_time`, `remark`) VALUES (100, 'Add User', 2, 1, '', 'F', 'users:add', 'Plus', 0, 1, 0, NULL, NULL, '2026-02-27 15:26:24', 1, '2026-05-10 01:20:05', '新增用户');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `menu_type`, `menu_key`, `icon`, `status`, `is_visible`, `is_deleted`, `user_id`, `created_by`, `create_time`, `updated_by`, `update_time`, `remark`) VALUES (101, 'Edit User', 2, 2, '', 'F', 'users:edit', 'Pencil', 0, 1, 0, NULL, NULL, '2026-02-27 15:26:24', NULL, '2026-02-27 15:26:24', '编辑用户');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `menu_type`, `menu_key`, `icon`, `status`, `is_visible`, `is_deleted`, `user_id`, `created_by`, `create_time`, `updated_by`, `update_time`, `remark`) VALUES (102, 'Delete User', 2, 3, '', 'F', 'users:delete', 'Trash2', 0, 1, 0, NULL, NULL, '2026-02-27 15:26:24', NULL, '2026-02-27 15:26:24', '删除用户');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `menu_type`, `menu_key`, `icon`, `status`, `is_visible`, `is_deleted`, `user_id`, `created_by`, `create_time`, `updated_by`, `update_time`, `remark`) VALUES (103, 'Add Role', 3, 1, '', 'F', 'roles:add', 'Plus', 0, 1, 0, NULL, NULL, '2026-02-27 15:26:24', NULL, '2026-02-27 15:26:24', '新增角色');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `menu_type`, `menu_key`, `icon`, `status`, `is_visible`, `is_deleted`, `user_id`, `created_by`, `create_time`, `updated_by`, `update_time`, `remark`) VALUES (104, 'Edit Role', 3, 2, '', 'F', 'roles:edit', 'Pencil', 0, 1, 0, NULL, NULL, '2026-02-27 15:26:24', NULL, '2026-02-27 15:26:24', '编辑角色');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `menu_type`, `menu_key`, `icon`, `status`, `is_visible`, `is_deleted`, `user_id`, `created_by`, `create_time`, `updated_by`, `update_time`, `remark`) VALUES (105, 'Delete Role', 3, 3, '', 'F', 'roles:delete', 'Trash2', 0, 1, 0, NULL, NULL, '2026-02-27 15:26:24', NULL, '2026-02-27 15:26:24', '删除角色');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `menu_type`, `menu_key`, `icon`, `status`, `is_visible`, `is_deleted`, `user_id`, `created_by`, `create_time`, `updated_by`, `update_time`, `remark`) VALUES (106, 'Assign Permissions', 3, 4, '', 'F', 'roles:assign', 'Key', 0, 1, 0, NULL, NULL, '2026-02-27 15:26:24', NULL, '2026-02-27 15:26:24', '分配权限');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `menu_type`, `menu_key`, `icon`, `status`, `is_visible`, `is_deleted`, `user_id`, `created_by`, `create_time`, `updated_by`, `update_time`, `remark`) VALUES (107, 'Add Menu', 4, 1, '', 'F', 'menus:add', 'Plus', 0, 1, 0, NULL, NULL, '2026-02-27 15:26:24', NULL, '2026-02-27 15:26:24', '新增菜单');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `menu_type`, `menu_key`, `icon`, `status`, `is_visible`, `is_deleted`, `user_id`, `created_by`, `create_time`, `updated_by`, `update_time`, `remark`) VALUES (108, 'Edit Menu', 4, 2, '', 'F', 'menus:edit', 'Pencil', 0, 1, 0, NULL, NULL, '2026-02-27 15:26:24', NULL, '2026-02-27 15:26:24', '编辑菜单');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `menu_type`, `menu_key`, `icon`, `status`, `is_visible`, `is_deleted`, `user_id`, `created_by`, `create_time`, `updated_by`, `update_time`, `remark`) VALUES (109, 'Delete Menu', 4, 3, '', 'F', 'menus:delete', 'Trash2', 0, 1, 0, NULL, NULL, '2026-02-27 15:26:24', NULL, '2026-02-27 15:26:24', '删除菜单');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `menu_type`, `menu_key`, `icon`, `status`, `is_visible`, `is_deleted`, `user_id`, `created_by`, `create_time`, `updated_by`, `update_time`, `remark`) VALUES (110, 'Add Device', 5, 1, '', 'F', 'devices:add', 'Plus', 0, 1, 0, NULL, NULL, '2026-02-27 15:26:24', NULL, '2026-02-27 15:26:24', '新增设备');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `menu_type`, `menu_key`, `icon`, `status`, `is_visible`, `is_deleted`, `user_id`, `created_by`, `create_time`, `updated_by`, `update_time`, `remark`) VALUES (111, 'Edit Device', 5, 2, '', 'F', 'devices:edit', 'Pencil', 0, 1, 0, NULL, NULL, '2026-02-27 15:26:24', NULL, '2026-02-27 15:26:24', '编辑设备');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `menu_type`, `menu_key`, `icon`, `status`, `is_visible`, `is_deleted`, `user_id`, `created_by`, `create_time`, `updated_by`, `update_time`, `remark`) VALUES (112, 'Delete Device', 5, 3, '', 'F', 'devices:delete', 'Trash2', 0, 1, 0, NULL, NULL, '2026-02-27 15:26:24', NULL, '2026-02-27 15:26:24', '删除设备');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `menu_type`, `menu_key`, `icon`, `status`, `is_visible`, `is_deleted`, `user_id`, `created_by`, `create_time`, `updated_by`, `update_time`, `remark`) VALUES (113, 'Add Model', 6, 1, '', 'F', 'models:add', 'Plus', 0, 1, 0, NULL, NULL, '2026-02-27 15:26:24', NULL, '2026-02-27 15:26:24', '新增模型');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `menu_type`, `menu_key`, `icon`, `status`, `is_visible`, `is_deleted`, `user_id`, `created_by`, `create_time`, `updated_by`, `update_time`, `remark`) VALUES (114, 'Edit Model', 6, 2, '', 'F', 'models:edit', 'Pencil', 0, 1, 0, NULL, NULL, '2026-02-27 15:26:24', NULL, '2026-02-27 15:26:24', '编辑模型');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `menu_type`, `menu_key`, `icon`, `status`, `is_visible`, `is_deleted`, `user_id`, `created_by`, `create_time`, `updated_by`, `update_time`, `remark`) VALUES (115, 'Delete Model', 6, 3, '', 'F', 'models:delete', 'Trash2', 0, 1, 0, NULL, NULL, '2026-02-27 15:26:24', NULL, '2026-02-27 15:26:24', '删除模型');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `menu_type`, `menu_key`, `icon`, `status`, `is_visible`, `is_deleted`, `user_id`, `created_by`, `create_time`, `updated_by`, `update_time`, `remark`) VALUES (116, 'Add Banner', 7, 1, '', 'F', 'banners:add', 'Plus', 0, 1, 0, NULL, NULL, '2026-02-27 15:26:24', NULL, '2026-02-27 15:26:24', '新增横幅');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `menu_type`, `menu_key`, `icon`, `status`, `is_visible`, `is_deleted`, `user_id`, `created_by`, `create_time`, `updated_by`, `update_time`, `remark`) VALUES (117, 'Edit Banner', 7, 2, '', 'F', 'banners:edit', 'Pencil', 0, 1, 0, NULL, NULL, '2026-02-27 15:26:24', NULL, '2026-02-27 15:26:24', '编辑横幅');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `menu_type`, `menu_key`, `icon`, `status`, `is_visible`, `is_deleted`, `user_id`, `created_by`, `create_time`, `updated_by`, `update_time`, `remark`) VALUES (118, 'Delete Banner', 7, 3, '', 'F', 'banners:delete', 'Trash2', 0, 1, 0, NULL, NULL, '2026-02-27 15:26:24', NULL, '2026-02-27 15:26:24', '删除横幅');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `menu_type`, `menu_key`, `icon`, `status`, `is_visible`, `is_deleted`, `user_id`, `created_by`, `create_time`, `updated_by`, `update_time`, `remark`) VALUES (119, 'Add Notice', 10, 1, '', 'F', 'notices:add', 'Plus', 0, 1, 0, NULL, NULL, '2026-02-27 15:26:24', NULL, '2026-02-27 15:26:24', '新增通知');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `menu_type`, `menu_key`, `icon`, `status`, `is_visible`, `is_deleted`, `user_id`, `created_by`, `create_time`, `updated_by`, `update_time`, `remark`) VALUES (120, 'Edit Notice', 10, 2, '', 'F', 'notices:edit', 'Pencil', 0, 1, 0, NULL, NULL, '2026-02-27 15:26:24', NULL, '2026-02-27 15:26:24', '编辑通知');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `menu_type`, `menu_key`, `icon`, `status`, `is_visible`, `is_deleted`, `user_id`, `created_by`, `create_time`, `updated_by`, `update_time`, `remark`) VALUES (121, 'Delete Notice', 10, 3, '', 'F', 'notices:delete', 'Trash2', 0, 1, 0, NULL, NULL, '2026-02-27 15:26:24', NULL, '2026-02-27 15:26:24', '删除通知');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `menu_type`, `menu_key`, `icon`, `status`, `is_visible`, `is_deleted`, `user_id`, `created_by`, `create_time`, `updated_by`, `update_time`, `remark`) VALUES (122, 'Edit Settings', 9, 1, '', 'F', 'settings:edit', 'Pencil', 0, 1, 0, NULL, NULL, '2026-02-27 15:26:24', NULL, '2026-02-27 15:26:24', '编辑设置');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `menu_type`, `menu_key`, `icon`, `status`, `is_visible`, `is_deleted`, `user_id`, `created_by`, `create_time`, `updated_by`, `update_time`, `remark`) VALUES (123, 'Model Settings', 6, 4, '', 'M', 'models:settings', 'Settings', 0, 1, 0, NULL, 1, '2026-04-17 09:17:02', 1, '2026-04-17 09:20:12', '模型类别管理权限');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `menu_type`, `menu_key`, `icon`, `status`, `is_visible`, `is_deleted`, `user_id`, `created_by`, `create_time`, `updated_by`, `update_time`, `remark`) VALUES (124, 'Class Config', 123, 1, '', 'F', 'models:class', 'Tags', 0, 1, 0, NULL, 1, '2026-04-17 09:17:02', 1, '2026-04-17 09:31:55', '模型绘图配置权限');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `menu_type`, `menu_key`, `icon`, `status`, `is_visible`, `is_deleted`, `user_id`, `created_by`, `create_time`, `updated_by`, `update_time`, `remark`) VALUES (125, 'Draw Config', 123, 2, '', 'F', 'models:drawConfig', 'Palette', 0, 1, 0, NULL, 1, '2026-04-17 09:20:12', 1, '2026-04-17 09:27:46', '绘图配置');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `menu_type`, `menu_key`, `icon`, `status`, `is_visible`, `is_deleted`, `user_id`, `created_by`, `create_time`, `updated_by`, `update_time`, `remark`) VALUES (126, 'Add Model Class', 123, 1, '', 'F', 'models:class:add', 'Plus', 0, 1, 0, NULL, 1, '2026-04-17 09:23:54', 1, '2026-04-17 09:30:35', '模型类别新增');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `menu_type`, `menu_key`, `icon`, `status`, `is_visible`, `is_deleted`, `user_id`, `created_by`, `create_time`, `updated_by`, `update_time`, `remark`) VALUES (127, 'Edit Model Class', 123, 2, '', 'F', 'models:class:edit', 'Pencil', 0, 1, 0, NULL, 1, '2026-04-17 09:23:54', 1, '2026-04-17 09:29:12', '模型类别编辑');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `menu_type`, `menu_key`, `icon`, `status`, `is_visible`, `is_deleted`, `user_id`, `created_by`, `create_time`, `updated_by`, `update_time`, `remark`) VALUES (128, 'Delete Model Class', 123, 3, '', 'F', 'models:class:delete', 'Trash2', 0, 1, 0, NULL, 1, '2026-04-17 09:23:54', 1, '2026-04-17 09:29:20', '模型类别删除');
COMMIT;

-- ----------------------------
-- Table structure for sys_notice
-- ----------------------------
DROP TABLE IF EXISTS `sys_notice`;
CREATE TABLE `sys_notice` (
  `notice_id` bigint NOT NULL AUTO_INCREMENT COMMENT '公告ID',
  `notice_title` varchar(100) NOT NULL COMMENT '公告标题',
  `notice_type` char(1) NOT NULL COMMENT '公告类型 1=通知 2=公告',
  `notice_content` text COMMENT '公告内容',
  `status` char(1) DEFAULT '0' COMMENT '公告状态 0=正常 1=关闭',
  `is_deleted` tinyint(1) DEFAULT '0' COMMENT '删除标志',
  `created_by` bigint DEFAULT NULL COMMENT '创建人ID',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_by` bigint DEFAULT NULL COMMENT '更新人ID',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`notice_id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='通知公告表';

-- ----------------------------
-- Records of sys_notice
-- ----------------------------
BEGIN;
COMMIT;

-- ----------------------------
-- Table structure for sys_notice_read
-- ----------------------------
DROP TABLE IF EXISTS `sys_notice_read`;
CREATE TABLE `sys_notice_read` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `notice_id` bigint NOT NULL COMMENT '通知ID',
  `user_id` bigint NOT NULL COMMENT '用户ID',
  `is_read` tinyint(1) DEFAULT '0' COMMENT '是否已读 0=未读 1=已读',
  `read_time` datetime DEFAULT NULL COMMENT '阅读时间',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_notice_user` (`notice_id`,`user_id`),
  KEY `idx_notice_id` (`notice_id`),
  KEY `idx_user_id` (`user_id`),
  CONSTRAINT `fk_notice_read_user` FOREIGN KEY (`user_id`) REFERENCES `sys_user` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='通知用户阅读记录表';

-- ----------------------------
-- Records of sys_notice_read
-- ----------------------------
BEGIN;
COMMIT;

-- ----------------------------
-- Table structure for sys_oper_log
-- ----------------------------
DROP TABLE IF EXISTS `sys_oper_log`;
CREATE TABLE `sys_oper_log` (
  `oper_id` bigint NOT NULL AUTO_INCREMENT COMMENT '日志ID',
  `title` varchar(50) DEFAULT '' COMMENT '模块标题',
  `business_type` int DEFAULT '0' COMMENT '业务类型 0=其它 1=新增 2=修改 3=删除 4=查询',
  `method` varchar(100) DEFAULT '' COMMENT '方法名称',
  `request_method` varchar(10) DEFAULT '' COMMENT '请求方式',
  `oper_user_id` bigint DEFAULT NULL COMMENT '操作人员',
  `oper_url` longblob COMMENT '请求URL',
  `oper_ip` varchar(128) DEFAULT '' COMMENT '主机地址',
  `oper_location` varchar(255) DEFAULT '' COMMENT '操作地点',
  `oper_param` text COMMENT '请求参数',
  `json_result` text COMMENT '返回参数',
  `status` int DEFAULT '0' COMMENT '操作状态 0=成功 1=失败',
  `error_msg` varchar(2000) DEFAULT '' COMMENT '错误消息',
  `cost_time` int DEFAULT '0' COMMENT '消耗时间(毫秒)',
  `created_by` bigint DEFAULT NULL COMMENT '创建人ID',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_by` bigint DEFAULT NULL COMMENT '更新人ID',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`oper_id`) USING BTREE,
  KEY `fk_oper_log_oper_user` (`oper_user_id`),
  CONSTRAINT `fk_oper_log_oper_user` FOREIGN KEY (`oper_user_id`) REFERENCES `sys_user` (`user_id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=35113 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='操作日志表';

-- ----------------------------
-- Records of sys_oper_log
-- ----------------------------
BEGIN;
COMMIT;

-- ----------------------------
-- Table structure for sys_role
-- ----------------------------
DROP TABLE IF EXISTS `sys_role`;
CREATE TABLE `sys_role` (
  `role_id` bigint NOT NULL AUTO_INCREMENT COMMENT '角色ID',
  `role_name` varchar(50) NOT NULL COMMENT '角色名称',
  `role_key` varchar(50) NOT NULL COMMENT '角色权限字符串',
  `role_sort` int NOT NULL COMMENT '显示顺序',
  `data_scope` char(1) DEFAULT '1' COMMENT '数据范围 1=全部 2=自定义 3=本部门 4=本部门及以下 5=仅本人',
  `status` char(1) DEFAULT '0' COMMENT '角色状态 0=正常 1=停用',
  `is_deleted` tinyint(1) DEFAULT '0' COMMENT '删除标志 0=未删除 1=已删除',
  `created_by` bigint DEFAULT NULL COMMENT '创建人ID',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_by` bigint DEFAULT NULL COMMENT '更新人ID',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `remark` varchar(500) DEFAULT NULL COMMENT '备注',
  PRIMARY KEY (`role_id`),
  UNIQUE KEY `uk_role_key` (`role_key`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='角色表';

-- ----------------------------
-- Records of sys_role
-- ----------------------------
BEGIN;
INSERT INTO `sys_role` (`role_id`, `role_name`, `role_key`, `role_sort`, `data_scope`, `status`, `is_deleted`, `created_by`, `create_time`, `updated_by`, `update_time`, `remark`) VALUES (1, 'admin', 'admin', 1, '1', '0', 0, 1, '2026-01-28 15:07:11', NULL, '2026-04-17 12:19:07', NULL);
INSERT INTO `sys_role` (`role_id`, `role_name`, `role_key`, `role_sort`, `data_scope`, `status`, `is_deleted`, `created_by`, `create_time`, `updated_by`, `update_time`, `remark`) VALUES (2, 'user', 'common', 2, '5', '0', 0, 1, '2026-01-28 15:07:11', NULL, '2026-04-26 17:27:57', NULL);
INSERT INTO `sys_role` (`role_id`, `role_name`, `role_key`, `role_sort`, `data_scope`, `status`, `is_deleted`, `created_by`, `create_time`, `updated_by`, `update_time`, `remark`) VALUES (3, '学生', 'student', 3, '1', '0', 1, 1, '2026-01-28 15:07:11', NULL, '2026-02-02 17:50:48', NULL);
COMMIT;

-- ----------------------------
-- Table structure for sys_role_menu
-- ----------------------------
DROP TABLE IF EXISTS `sys_role_menu`;
CREATE TABLE `sys_role_menu` (
  `role_id` bigint NOT NULL COMMENT '角色ID',
  `menu_id` bigint NOT NULL COMMENT '菜单ID',
  `created_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`role_id`,`menu_id`),
  KEY `idx_role_id` (`role_id`),
  KEY `idx_menu_id` (`menu_id`),
  CONSTRAINT `fk_role_menu_menu` FOREIGN KEY (`menu_id`) REFERENCES `sys_menu` (`menu_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_role_menu_role` FOREIGN KEY (`role_id`) REFERENCES `sys_role` (`role_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='角色和菜单关联表';

-- ----------------------------
-- Records of sys_role_menu
-- ----------------------------
BEGIN;
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`, `created_time`) VALUES (1, 1, '2026-04-17 11:55:25');
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`, `created_time`) VALUES (1, 2, '2026-04-17 11:55:25');
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`, `created_time`) VALUES (1, 3, '2026-04-17 11:55:25');
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`, `created_time`) VALUES (1, 4, '2026-04-17 11:55:25');
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`, `created_time`) VALUES (1, 5, '2026-04-17 11:55:25');
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`, `created_time`) VALUES (1, 6, '2026-04-17 11:55:25');
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`, `created_time`) VALUES (1, 7, '2026-04-17 11:55:25');
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`, `created_time`) VALUES (1, 8, '2026-04-17 11:55:25');
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`, `created_time`) VALUES (1, 9, '2026-04-17 11:55:25');
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`, `created_time`) VALUES (1, 10, '2026-04-17 11:55:25');
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`, `created_time`) VALUES (1, 11, '2026-04-17 11:55:25');
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`, `created_time`) VALUES (1, 100, '2026-04-17 11:55:25');
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`, `created_time`) VALUES (1, 101, '2026-04-17 11:55:25');
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`, `created_time`) VALUES (1, 102, '2026-04-17 11:55:25');
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`, `created_time`) VALUES (1, 103, '2026-04-17 11:55:25');
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`, `created_time`) VALUES (1, 104, '2026-04-17 11:55:25');
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`, `created_time`) VALUES (1, 105, '2026-04-17 11:55:25');
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`, `created_time`) VALUES (1, 106, '2026-04-17 11:55:25');
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`, `created_time`) VALUES (1, 107, '2026-04-17 11:55:25');
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`, `created_time`) VALUES (1, 108, '2026-04-17 11:55:25');
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`, `created_time`) VALUES (1, 109, '2026-04-17 11:55:25');
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`, `created_time`) VALUES (1, 110, '2026-04-17 11:55:25');
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`, `created_time`) VALUES (1, 111, '2026-04-17 11:55:25');
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`, `created_time`) VALUES (1, 112, '2026-04-17 11:55:25');
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`, `created_time`) VALUES (1, 113, '2026-04-17 11:55:25');
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`, `created_time`) VALUES (1, 114, '2026-04-17 11:55:25');
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`, `created_time`) VALUES (1, 115, '2026-04-17 11:55:25');
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`, `created_time`) VALUES (1, 116, '2026-04-17 11:55:25');
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`, `created_time`) VALUES (1, 117, '2026-04-17 11:55:25');
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`, `created_time`) VALUES (1, 118, '2026-04-17 11:55:25');
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`, `created_time`) VALUES (1, 119, '2026-04-17 11:55:25');
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`, `created_time`) VALUES (1, 120, '2026-04-17 11:55:25');
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`, `created_time`) VALUES (1, 121, '2026-04-17 11:55:25');
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`, `created_time`) VALUES (1, 122, '2026-04-17 11:55:25');
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`, `created_time`) VALUES (1, 123, '2026-04-17 11:55:25');
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`, `created_time`) VALUES (1, 124, '2026-04-17 11:55:25');
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`, `created_time`) VALUES (1, 125, '2026-04-17 11:55:25');
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`, `created_time`) VALUES (1, 126, '2026-04-17 11:55:25');
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`, `created_time`) VALUES (1, 127, '2026-04-17 11:55:25');
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`, `created_time`) VALUES (1, 128, '2026-04-17 11:55:25');
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`, `created_time`) VALUES (2, 1, '2026-05-10 03:15:22');
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`, `created_time`) VALUES (2, 2, '2026-05-10 03:15:22');
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`, `created_time`) VALUES (2, 5, '2026-05-10 03:15:22');
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`, `created_time`) VALUES (2, 6, '2026-05-10 03:15:22');
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`, `created_time`) VALUES (2, 8, '2026-05-10 03:15:22');
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`, `created_time`) VALUES (2, 9, '2026-05-10 03:15:22');
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`, `created_time`) VALUES (2, 10, '2026-05-10 03:15:22');
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`, `created_time`) VALUES (2, 11, '2026-05-10 03:15:22');
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`, `created_time`) VALUES (2, 100, '2026-05-10 03:15:22');
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`, `created_time`) VALUES (2, 101, '2026-05-10 03:15:22');
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`, `created_time`) VALUES (2, 102, '2026-05-10 03:15:22');
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`, `created_time`) VALUES (2, 110, '2026-05-10 03:15:22');
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`, `created_time`) VALUES (2, 111, '2026-05-10 03:15:22');
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`, `created_time`) VALUES (2, 112, '2026-05-10 03:15:22');
COMMIT;

-- ----------------------------
-- Table structure for sys_user
-- ----------------------------
DROP TABLE IF EXISTS `sys_user`;
CREATE TABLE `sys_user` (
  `user_id` bigint NOT NULL AUTO_INCREMENT COMMENT '用户ID',
  `user_name` varchar(50) NOT NULL COMMENT '用户名',
  `nick_name` varchar(50) DEFAULT NULL COMMENT '昵称',
  `email` varchar(100) DEFAULT NULL COMMENT '邮箱',
  `phonenumber` varchar(20) DEFAULT NULL COMMENT '手机号',
  `sex` char(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT '2' COMMENT '性别 0=男 1=女 2=未知',
  `avatar` varchar(255) DEFAULT NULL COMMENT '头像地址',
  `password` varchar(100) NOT NULL COMMENT '密码',
  `status` char(1) DEFAULT '0' COMMENT '帐号状态 0=正常 1=停用',
  `login_ip` varchar(128) DEFAULT NULL COMMENT '最后登录IP',
  `login_date` datetime DEFAULT NULL COMMENT '最后登录时间',
  `role_id` bigint DEFAULT NULL COMMENT '角色ID',
  `is_deleted` tinyint(1) DEFAULT '0' COMMENT '删除标志 0=未删除 1=已删除',
  `created_by` bigint DEFAULT NULL COMMENT '创建人ID',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_by` bigint DEFAULT NULL COMMENT '更新人ID',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `remark` varchar(500) DEFAULT NULL COMMENT '备注',
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `uk_user_name` (`user_name`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='用户表';

-- ----------------------------
-- Records of sys_user
-- ----------------------------
BEGIN;
INSERT INTO `sys_user` (`user_id`, `user_name`, `nick_name`, `email`, `phonenumber`, `sex`, `avatar`, `password`, `status`, `login_ip`, `login_date`, `role_id`, `is_deleted`, `created_by`, `create_time`, `updated_by`, `update_time`, `remark`) VALUES (1, 'admin', 'admin', 'admin@classai.edu', '13800138000', '0', 'http://127.0.0.1:9000/classai-edu/2026/02/03/c87bab87456f4d09aa8d0a1cbd27a77e.jpg', '$2b$12$GqhYq4Ef5r7nH/xnYcAs2.4TLD/z/cXKXrG9Ecy51yVfaLOAxNDLG', '0', NULL, NULL, 1, 0, NULL, '2026-01-28 15:07:11', NULL, '2026-04-15 20:55:53', NULL);
COMMIT;

-- ----------------------------
-- Table structure for sys_user_online
-- ----------------------------
DROP TABLE IF EXISTS `sys_user_online`;
CREATE TABLE `sys_user_online` (
  `session_id` varchar(50) NOT NULL COMMENT '用户会话ID',
  `user_id` bigint DEFAULT NULL COMMENT '用户ID',
  `user_name` varchar(50) DEFAULT '' COMMENT '用户账号',
  `ipaddr` varchar(128) DEFAULT '' COMMENT '登录IP地址',
  `login_location` varchar(255) DEFAULT '' COMMENT '登录地点',
  `browser` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '浏览器类型',
  `os` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT '' COMMENT '操作系统',
  `status` varchar(10) DEFAULT 'on_line' COMMENT '在线状态 on_line/off_line',
  `start_timestamp` datetime DEFAULT CURRENT_TIMESTAMP COMMENT 'session创建时间',
  `last_access_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT 'session最后访问时间',
  `expire_time` int DEFAULT '1800' COMMENT '超时时间(秒)',
  `created_by` bigint DEFAULT NULL COMMENT '创建人ID',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_by` bigint DEFAULT NULL COMMENT '更新人ID',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`session_id`),
  KEY `fk_user_online_user` (`user_id`),
  CONSTRAINT `fk_user_online_user` FOREIGN KEY (`user_id`) REFERENCES `sys_user` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='在线用户表';

-- ----------------------------
-- Records of sys_user_online
-- ----------------------------
BEGIN;
COMMIT;

SET FOREIGN_KEY_CHECKS = 1;
