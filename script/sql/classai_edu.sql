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

 Date: 29/01/2026 02:06:26
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for alert_record
-- ----------------------------
DROP TABLE IF EXISTS `alert_record`;
CREATE TABLE `alert_record` (
  `alert_id` bigint NOT NULL AUTO_INCREMENT COMMENT '告警ID',
  `task_id` bigint NOT NULL COMMENT '任务ID',
  `cap_id` bigint DEFAULT NULL COMMENT '视频ID',
  `alert_type` varchar(50) NOT NULL COMMENT '告警类型',
  `alert_level` varchar(20) NOT NULL COMMENT '告警级别 info/warning/error/critical',
  `alert_title` varchar(200) NOT NULL COMMENT '告警标题',
  `alert_message` text COMMENT '告警信息',
  `frame_index` int DEFAULT NULL COMMENT '帧索引',
  `timestamp` decimal(10,3) DEFAULT NULL COMMENT '时间戳',
  `trigger_value` varchar(100) DEFAULT NULL COMMENT '触发值',
  `threshold_value` varchar(100) DEFAULT NULL COMMENT '阈值',
  `screenshot_path` varchar(500) DEFAULT NULL COMMENT '截图路径',
  `is_handled` tinyint(1) DEFAULT '0' COMMENT '是否已处理',
  `handled_by` bigint DEFAULT NULL COMMENT '处理人ID',
  `handled_time` datetime DEFAULT NULL COMMENT '处理时间',
  `handle_note` text COMMENT '处理备注',
  `is_deleted` tinyint(1) DEFAULT '0' COMMENT '删除标志',
  `created_by` bigint DEFAULT NULL COMMENT '创建人ID',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_by` bigint DEFAULT NULL COMMENT '更新人ID',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`alert_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='告警记录表';

-- ----------------------------
-- Records of alert_record
-- ----------------------------
BEGIN;
COMMIT;

-- ----------------------------
-- Table structure for behavior_analysis
-- ----------------------------
DROP TABLE IF EXISTS `behavior_analysis`;
CREATE TABLE `behavior_analysis` (
  `analysis_id` bigint NOT NULL AUTO_INCREMENT COMMENT '分析ID',
  `task_id` bigint NOT NULL COMMENT '任务ID',
  `cap_id` bigint DEFAULT NULL COMMENT '视频ID',
  `analysis_date` date DEFAULT NULL COMMENT '分析日期',
  `total_students` int DEFAULT '0' COMMENT '总学生数',
  `total_frames` int DEFAULT '0' COMMENT '总帧数',
  `total_detections` int DEFAULT '0' COMMENT '总检测数',
  `behavior_stats` text COMMENT '行为统计JSON',
  `timeline_data` text COMMENT '时间线数据JSON',
  `heatmap_data` text COMMENT '热力图数据JSON',
  `peak_time` varchar(50) DEFAULT NULL COMMENT '高峰时间',
  `analysis_summary` text COMMENT '分析摘要',
  `risk_level` varchar(20) DEFAULT 'low' COMMENT '风险等级 low/medium/high',
  `alert_triggered` tinyint(1) DEFAULT '0' COMMENT '是否触发告警',
  `is_deleted` tinyint(1) DEFAULT '0' COMMENT '删除标志',
  `created_by` bigint DEFAULT NULL COMMENT '创建人ID',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_by` bigint DEFAULT NULL COMMENT '更新人ID',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`analysis_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='行为分析表';

-- ----------------------------
-- Records of behavior_analysis
-- ----------------------------
BEGIN;
COMMIT;

-- ----------------------------
-- Table structure for cap_resource
-- ----------------------------
DROP TABLE IF EXISTS `cap_resource`;
CREATE TABLE `cap_resource` (
  `cap_id` bigint NOT NULL AUTO_INCREMENT COMMENT '视频ID',
  `cap_name` varchar(200) NOT NULL COMMENT '视频名称',
  `cap_path` varchar(500) NOT NULL COMMENT '视频路径',
  `cap_url` varchar(500) DEFAULT NULL COMMENT '视频URL',
  `thumbnail_path` varchar(500) DEFAULT NULL COMMENT '缩略图路径',
  `thumbnail_url` varchar(500) DEFAULT NULL COMMENT '缩略图URL',
  `cap_format` varchar(20) DEFAULT NULL COMMENT '视频格式 mp4/avi等',
  `cap_size_mb` decimal(10,2) DEFAULT NULL COMMENT '文件大小(MB)',
  `duration_seconds` int DEFAULT NULL COMMENT '时长(秒)',
  `width` int DEFAULT NULL COMMENT '视频宽度',
  `height` int DEFAULT NULL COMMENT '视频高度',
  `fps` decimal(5,2) DEFAULT NULL COMMENT '帧率',
  `total_frames` int DEFAULT NULL COMMENT '总帧数',
  `codec` varchar(50) DEFAULT NULL COMMENT '编码格式',
  `bitrate` int DEFAULT NULL COMMENT '比特率',
  `source_type` varchar(20) DEFAULT 'upload' COMMENT '来源类型 upload/url/camera/rtsp',
  `camera_id` varchar(100) DEFAULT NULL COMMENT '摄像头ID',
  `rtsp_url` varchar(500) DEFAULT NULL COMMENT 'RTSP地址',
  `location` varchar(200) DEFAULT NULL COMMENT '拍摄位置',
  `record_date` date DEFAULT NULL COMMENT '录制日期',
  `description` text COMMENT '描述',
  `status` varchar(20) DEFAULT 'ready' COMMENT '状态 ready/processing/completed/error',
  `uploaded_by` bigint DEFAULT NULL COMMENT '上传人ID',
  `is_deleted` tinyint(1) DEFAULT '0' COMMENT '删除标志',
  `created_by` bigint DEFAULT NULL COMMENT '创建人ID',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_by` bigint DEFAULT NULL COMMENT '更新人ID',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`cap_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='视频资源表';

-- ----------------------------
-- Records of cap_resource
-- ----------------------------
BEGIN;
COMMIT;

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
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='AI检测结果表';

-- ----------------------------
-- Records of class_index_banner
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
  `frame_index` int DEFAULT NULL COMMENT '帧索引(视频任务)',
  `timestamp_ms` bigint DEFAULT NULL COMMENT '时间戳(毫秒)',
  `class_id` bigint DEFAULT NULL COMMENT '类别ID',
  `class_name` varchar(50) NOT NULL COMMENT '类别名称',
  `class_index` int NOT NULL COMMENT '类别索引',
  `confidence` decimal(5,4) NOT NULL COMMENT '置信度',
  `bbox_x1` decimal(10,2) NOT NULL COMMENT '边界框x1',
  `bbox_y1` decimal(10,2) NOT NULL COMMENT '边界框y1',
  `bbox_x2` decimal(10,2) NOT NULL COMMENT '边界框x2',
  `bbox_y2` decimal(10,2) NOT NULL COMMENT '边界框y2',
  `bbox_center_x` decimal(10,2) DEFAULT NULL COMMENT '中心点X',
  `bbox_center_y` decimal(10,2) DEFAULT NULL COMMENT '中心点Y',
  `bbox_width` decimal(10,2) DEFAULT NULL COMMENT '宽度',
  `bbox_height` decimal(10,2) DEFAULT NULL COMMENT '高度',
  `area` decimal(10,2) DEFAULT NULL COMMENT '面积',
  `track_id` int DEFAULT NULL COMMENT '跟踪ID',
  `track_age` int DEFAULT NULL COMMENT '跟踪年龄',
  `color` varchar(20) DEFAULT NULL COMMENT '标注颜色',
  `is_occluded` tinyint(1) DEFAULT '0' COMMENT '是否被遮挡',
  `is_truncated` tinyint(1) DEFAULT '0' COMMENT '是否被截断',
  `is_deleted` tinyint(1) DEFAULT '0' COMMENT '删除标志',
  `created_by` bigint DEFAULT NULL COMMENT '创建人ID',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_by` bigint DEFAULT NULL COMMENT '更新人ID',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`detail_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='检测详情表';

-- ----------------------------
-- Records of detection_detail
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
  `task_type` varchar(20) NOT NULL COMMENT '任务类型 image/cap/realtime/batch',
  `task_status` varchar(20) DEFAULT 'pending' COMMENT '任务状态 pending/running/completed/failed/cancelled',
  `model_id` bigint NOT NULL COMMENT '使用的模型ID',
  `model_name` varchar(100) DEFAULT NULL COMMENT '模型名称',
  `conf_threshold` decimal(5,4) DEFAULT '0.5000' COMMENT '置信度阈值',
  `iou_threshold` decimal(5,4) DEFAULT '0.4500' COMMENT 'IOU阈值',
  `enable_tracking` tinyint(1) DEFAULT '0' COMMENT '是否启用跟踪',
  `source_type` varchar(20) NOT NULL COMMENT '来源类型 upload/url/camera/rtsp',
  `source_path` varchar(500) DEFAULT NULL COMMENT '源文件路径',
  `source_url` varchar(500) DEFAULT NULL COMMENT '源文件URL',
  `total_frames` int DEFAULT '0' COMMENT '总帧数',
  `processed_frames` int DEFAULT '0' COMMENT '已处理帧数',
  `progress` decimal(5,2) DEFAULT '0.00' COMMENT '进度百分比',
  `total_detections` int DEFAULT '0' COMMENT '总检测数',
  `num_boxes` int DEFAULT '0' COMMENT '边界框数量',
  `cls_counts` text COMMENT '各类别统计JSON',
  `save_video` tinyint(1) DEFAULT '0' COMMENT '是否保存视频',
  `save_images` tinyint(1) DEFAULT '0' COMMENT '是否保存图片',
  `output_path` varchar(500) DEFAULT NULL COMMENT '输出文件路径',
  `image_base64` mediumtext COMMENT '标注图片base64(单图)',
  `image_url` varchar(500) DEFAULT NULL COMMENT '标注图片URL',
  `width` int DEFAULT NULL COMMENT '图像/视频宽度',
  `height` int DEFAULT NULL COMMENT '图像/视频高度',
  `fps` decimal(5,2) DEFAULT NULL COMMENT '帧率',
  `start_time` datetime DEFAULT NULL COMMENT '开始时间',
  `end_time` datetime DEFAULT NULL COMMENT '结束时间',
  `duration_seconds` int DEFAULT NULL COMMENT '耗时(秒)',
  `processing_time_ms` int DEFAULT NULL COMMENT '处理时间(毫秒)',
  `error_message` text COMMENT '错误信息',
  `file_size_kb` int DEFAULT NULL COMMENT '文件大小(KB)',
  `is_deleted` tinyint(1) DEFAULT '0' COMMENT '删除标志',
  `created_by` bigint DEFAULT NULL COMMENT '创建人ID',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_by` bigint DEFAULT NULL COMMENT '更新人ID',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`task_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='检测任务表(合并任务和结果)';

-- ----------------------------
-- Records of detection_task
-- ----------------------------
BEGIN;
COMMIT;

-- ----------------------------
-- Table structure for image_resource
-- ----------------------------
DROP TABLE IF EXISTS `image_resource`;
CREATE TABLE `image_resource` (
  `image_id` bigint NOT NULL AUTO_INCREMENT COMMENT '图像ID',
  `image_name` varchar(200) NOT NULL COMMENT '图像名称',
  `image_path` varchar(500) NOT NULL COMMENT '图像路径',
  `image_url` varchar(500) DEFAULT NULL COMMENT '图像URL',
  `thumbnail_path` varchar(500) DEFAULT NULL COMMENT '缩略图路径',
  `thumbnail_url` varchar(500) DEFAULT NULL COMMENT '缩略图URL',
  `image_format` varchar(20) DEFAULT NULL COMMENT '图像格式 jpg/png等',
  `image_size_kb` int DEFAULT NULL COMMENT '文件大小(KB)',
  `width` int DEFAULT NULL COMMENT '图像宽度',
  `height` int DEFAULT NULL COMMENT '图像高度',
  `channels` int DEFAULT NULL COMMENT '通道数',
  `aspect_ratio` varchar(20) DEFAULT NULL COMMENT '宽高比',
  `resolution` varchar(20) DEFAULT NULL COMMENT '分辨率',
  `source_type` varchar(20) DEFAULT 'upload' COMMENT '来源类型 upload/url/cap_frame',
  `cap_id` bigint DEFAULT NULL COMMENT '来源视频ID',
  `frame_index` int DEFAULT NULL COMMENT '帧索引',
  `capture_time` datetime DEFAULT NULL COMMENT '拍摄时间',
  `location` varchar(200) DEFAULT NULL COMMENT '拍摄位置',
  `description` text COMMENT '描述',
  `is_annotated` tinyint(1) DEFAULT '0' COMMENT '是否已标注',
  `uploaded_by` bigint DEFAULT NULL COMMENT '上传人ID',
  `is_deleted` tinyint(1) DEFAULT '0' COMMENT '删除标志',
  `created_by` bigint DEFAULT NULL COMMENT '创建人ID',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_by` bigint DEFAULT NULL COMMENT '更新人ID',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`image_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='图像资源表';

-- ----------------------------
-- Records of image_resource
-- ----------------------------
BEGIN;
COMMIT;

-- ----------------------------
-- Table structure for model_class
-- ----------------------------
DROP TABLE IF EXISTS `model_class`;
CREATE TABLE `model_class` (
  `class_id` bigint NOT NULL AUTO_INCREMENT COMMENT '类别ID',
  `model_id` bigint NOT NULL COMMENT '模型ID',
  `class_name` varchar(50) NOT NULL COMMENT '类别名称',
  `class_name_en` varchar(50) NOT NULL COMMENT '类别英文名称',
  `class_name_zh` varchar(50) NOT NULL COMMENT '类别中文名称',
  `class_index` int NOT NULL COMMENT '类别索引',
  `class_code` varchar(20) DEFAULT NULL COMMENT '类别代码',
  `description` text COMMENT '类别描述',
  `is_active` tinyint(1) DEFAULT '1' COMMENT '是否启用',
  `sort_order` int DEFAULT '0' COMMENT '排序',
  `is_deleted` tinyint(1) DEFAULT '0' COMMENT '删除标志',
  `created_by` bigint DEFAULT NULL COMMENT '创建人ID',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_by` bigint DEFAULT NULL COMMENT '更新人ID',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`class_id`),
  UNIQUE KEY `uk_model_class` (`model_id`,`class_index`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='模型类别表';

-- ----------------------------
-- Records of model_class
-- ----------------------------
BEGIN;
INSERT INTO `model_class` (`class_id`, `model_id`, `class_name`, `class_name_en`, `class_name_zh`, `class_index`, `class_code`, `description`, `is_active`, `sort_order`, `is_deleted`, `created_by`, `create_time`, `updated_by`, `update_time`) VALUES (1, 1, 'learning_to_copy', 'learning_to_copy', '试图抄袭', 0, NULL, '学生试图抄袭他人作业或答案', 1, 0, 0, 1, '2026-01-28 15:07:11', NULL, '2026-01-28 15:07:11');
INSERT INTO `model_class` (`class_id`, `model_id`, `class_name`, `class_name_en`, `class_name_zh`, `class_index`, `class_code`, `description`, `is_active`, `sort_order`, `is_deleted`, `created_by`, `create_time`, `updated_by`, `update_time`) VALUES (2, 1, 'looking_around', 'looking_around', '东张西望', 1, NULL, '学生在课堂上东张西望，注意力不集中', 1, 0, 0, 1, '2026-01-28 15:07:11', NULL, '2026-01-28 15:07:11');
INSERT INTO `model_class` (`class_id`, `model_id`, `class_name`, `class_name_en`, `class_name_zh`, `class_index`, `class_code`, `description`, `is_active`, `sort_order`, `is_deleted`, `created_by`, `create_time`, `updated_by`, `update_time`) VALUES (3, 1, 'sharing_answers', 'sharing_answers', '分享答案', 2, NULL, '学生与他人分享答案', 1, 0, 0, 1, '2026-01-28 15:07:11', NULL, '2026-01-28 15:07:11');
INSERT INTO `model_class` (`class_id`, `model_id`, `class_name`, `class_name_en`, `class_name_zh`, `class_index`, `class_code`, `description`, `is_active`, `sort_order`, `is_deleted`, `created_by`, `create_time`, `updated_by`, `update_time`) VALUES (4, 1, 'sleeping', 'sleeping', '睡觉', 3, NULL, '学生在课堂上睡觉', 1, 0, 0, 1, '2026-01-28 15:07:11', NULL, '2026-01-28 15:07:11');
INSERT INTO `model_class` (`class_id`, `model_id`, `class_name`, `class_name_en`, `class_name_zh`, `class_index`, `class_code`, `description`, `is_active`, `sort_order`, `is_deleted`, `created_by`, `create_time`, `updated_by`, `update_time`) VALUES (5, 1, 'staff', 'staff', '工作人员', 4, NULL, '教师或工作人员', 1, 0, 0, 1, '2026-01-28 15:07:11', NULL, '2026-01-28 15:07:11');
INSERT INTO `model_class` (`class_id`, `model_id`, `class_name`, `class_name_en`, `class_name_zh`, `class_index`, `class_code`, `description`, `is_active`, `sort_order`, `is_deleted`, `created_by`, `create_time`, `updated_by`, `update_time`) VALUES (6, 1, 'using_mobile', 'using_mobile', '使用电子设备', 5, NULL, '学生在课堂上使用手机或其他电子设备', 1, 0, 0, 1, '2026-01-28 15:07:11', NULL, '2026-01-28 15:07:11');
COMMIT;

-- ----------------------------
-- Table structure for model_color_config
-- ----------------------------
DROP TABLE IF EXISTS `model_color_config`;
CREATE TABLE `model_color_config` (
  `color_id` bigint NOT NULL AUTO_INCREMENT COMMENT '颜色配置ID',
  `model_id` bigint NOT NULL COMMENT '模型ID',
  `class_id` bigint NOT NULL COMMENT '类别ID',
  `class_name` varchar(50) NOT NULL COMMENT '类别名称',
  `color_name` varchar(50) DEFAULT NULL COMMENT '颜色名称',
  `color_hex` varchar(20) NOT NULL COMMENT '颜色十六进制值',
  `color_rgb` varchar(30) DEFAULT NULL COMMENT '颜色RGB值',
  `color_bgr` varchar(30) DEFAULT NULL COMMENT '颜色BGR值(OpenCV格式)',
  `border_thickness` int DEFAULT '2' COMMENT '边框粗细',
  `font_scale` decimal(3,2) DEFAULT '0.50' COMMENT '字体大小',
  `font_thickness` int DEFAULT '1' COMMENT '字体粗细',
  `background_color` varchar(20) DEFAULT NULL COMMENT '背景颜色',
  `text_color` varchar(20) DEFAULT '#FFFFFF' COMMENT '文本颜色',
  `alpha` decimal(3,2) DEFAULT '0.50' COMMENT '透明度',
  `display_label` tinyint(1) DEFAULT '1' COMMENT '是否显示标签',
  `display_confidence` tinyint(1) DEFAULT '1' COMMENT '是否显示置信度',
  `display_box` tinyint(1) DEFAULT '1' COMMENT '是否显示边框',
  `is_default` tinyint(1) DEFAULT '0' COMMENT '是否默认配置',
  `is_deleted` tinyint(1) DEFAULT '0' COMMENT '删除标志',
  `created_by` bigint DEFAULT NULL COMMENT '创建人ID',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_by` bigint DEFAULT NULL COMMENT '更新人ID',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`color_id`),
  UNIQUE KEY `uk_model_class_color` (`model_id`,`class_id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='模型标注颜色配置表';

-- ----------------------------
-- Records of model_color_config
-- ----------------------------
BEGIN;
INSERT INTO `model_color_config` (`color_id`, `model_id`, `class_id`, `class_name`, `color_name`, `color_hex`, `color_rgb`, `color_bgr`, `border_thickness`, `font_scale`, `font_thickness`, `background_color`, `text_color`, `alpha`, `display_label`, `display_confidence`, `display_box`, `is_default`, `is_deleted`, `created_by`, `create_time`, `updated_by`, `update_time`) VALUES (1, 1, 1, 'learning_to_copy', '红色', '#FF0000', 'rgb(255, 0, 0)', '(0, 0, 255)', 2, 0.50, 1, NULL, '#FFFFFF', 0.50, 1, 1, 1, 0, 0, 1, '2026-01-28 15:07:11', NULL, '2026-01-28 15:07:11');
INSERT INTO `model_color_config` (`color_id`, `model_id`, `class_id`, `class_name`, `color_name`, `color_hex`, `color_rgb`, `color_bgr`, `border_thickness`, `font_scale`, `font_thickness`, `background_color`, `text_color`, `alpha`, `display_label`, `display_confidence`, `display_box`, `is_default`, `is_deleted`, `created_by`, `create_time`, `updated_by`, `update_time`) VALUES (2, 1, 2, 'looking_around', '黄色', '#FFFF00', 'rgb(255, 255, 0)', '(0, 255, 255)', 2, 0.50, 1, NULL, '#FFFFFF', 0.50, 1, 1, 1, 0, 0, 1, '2026-01-28 15:07:11', NULL, '2026-01-28 15:07:11');
INSERT INTO `model_color_config` (`color_id`, `model_id`, `class_id`, `class_name`, `color_name`, `color_hex`, `color_rgb`, `color_bgr`, `border_thickness`, `font_scale`, `font_thickness`, `background_color`, `text_color`, `alpha`, `display_label`, `display_confidence`, `display_box`, `is_default`, `is_deleted`, `created_by`, `create_time`, `updated_by`, `update_time`) VALUES (3, 1, 3, 'sharing_answers', '绿色', '#00FF00', 'rgb(0, 255, 0)', '(0, 255, 0)', 2, 0.50, 1, NULL, '#FFFFFF', 0.50, 1, 1, 1, 0, 0, 1, '2026-01-28 15:07:11', NULL, '2026-01-28 15:07:11');
INSERT INTO `model_color_config` (`color_id`, `model_id`, `class_id`, `class_name`, `color_name`, `color_hex`, `color_rgb`, `color_bgr`, `border_thickness`, `font_scale`, `font_thickness`, `background_color`, `text_color`, `alpha`, `display_label`, `display_confidence`, `display_box`, `is_default`, `is_deleted`, `created_by`, `create_time`, `updated_by`, `update_time`) VALUES (4, 1, 4, 'sleeping', '蓝色', '#0000FF', 'rgb(0, 0, 255)', '(255, 0, 0)', 2, 0.50, 1, NULL, '#FFFFFF', 0.50, 1, 1, 1, 0, 0, 1, '2026-01-28 15:07:11', NULL, '2026-01-28 15:07:11');
INSERT INTO `model_color_config` (`color_id`, `model_id`, `class_id`, `class_name`, `color_name`, `color_hex`, `color_rgb`, `color_bgr`, `border_thickness`, `font_scale`, `font_thickness`, `background_color`, `text_color`, `alpha`, `display_label`, `display_confidence`, `display_box`, `is_default`, `is_deleted`, `created_by`, `create_time`, `updated_by`, `update_time`) VALUES (5, 1, 5, 'staff', '紫色', '#FF00FF', 'rgb(255, 0, 255)', '(255, 0, 255)', 2, 0.50, 1, NULL, '#FFFFFF', 0.50, 1, 1, 1, 0, 0, 1, '2026-01-28 15:07:11', NULL, '2026-01-28 15:07:11');
INSERT INTO `model_color_config` (`color_id`, `model_id`, `class_id`, `class_name`, `color_name`, `color_hex`, `color_rgb`, `color_bgr`, `border_thickness`, `font_scale`, `font_thickness`, `background_color`, `text_color`, `alpha`, `display_label`, `display_confidence`, `display_box`, `is_default`, `is_deleted`, `created_by`, `create_time`, `updated_by`, `update_time`) VALUES (6, 1, 6, 'using_mobile', '青色', '#00FFFF', 'rgb(0, 255, 255)', '(255, 255, 0)', 2, 0.50, 1, NULL, '#FFFFFF', 0.50, 1, 1, 1, 0, 0, 1, '2026-01-28 15:07:11', NULL, '2026-01-28 15:07:11');
COMMIT;

-- ----------------------------
-- Table structure for model_config
-- ----------------------------
DROP TABLE IF EXISTS `model_config`;
CREATE TABLE `model_config` (
  `model_id` bigint NOT NULL AUTO_INCREMENT COMMENT '模型ID',
  `model_name` varchar(100) NOT NULL COMMENT '模型名称',
  `model_version` varchar(50) DEFAULT NULL COMMENT '模型版本',
  `model_type` varchar(50) DEFAULT 'yolov8' COMMENT '模型类型 yolov8/yolov5等',
  `model_size` varchar(20) DEFAULT 'n' COMMENT '模型大小 n/m/l/x',
  `model_path` varchar(500) NOT NULL COMMENT '模型文件路径',
  `model_url` varchar(500) DEFAULT NULL COMMENT '模型下载地址',
  `input_size` int DEFAULT '640' COMMENT '输入图像尺寸',
  `num_classes` int DEFAULT '6' COMMENT '类别数量',
  `conf_threshold` decimal(5,4) DEFAULT '0.5000' COMMENT '置信度阈值',
  `iou_threshold` decimal(5,4) DEFAULT '0.4500' COMMENT 'IOU阈值',
  `is_default` tinyint(1) DEFAULT '0' COMMENT '是否默认模型 0=否 1=是',
  `is_active` tinyint(1) DEFAULT '1' COMMENT '是否启用 0=禁用 1=启用',
  `model_size_mb` decimal(10,2) DEFAULT NULL COMMENT '模型文件大小(MB)',
  `precision` varchar(20) DEFAULT 'fp32' COMMENT '精度类型 fp32/fp16/int8',
  `inference_time_ms` int DEFAULT NULL COMMENT '推理时间(毫秒)',
  `map50` decimal(5,4) DEFAULT NULL COMMENT 'mAP@50',
  `map50_95` decimal(5,4) DEFAULT NULL COMMENT 'mAP@50-95',
  `training_epochs` int DEFAULT NULL COMMENT '训练轮数',
  `training_dataset` varchar(255) DEFAULT NULL COMMENT '训练数据集',
  `description` text COMMENT '模型描述',
  `is_deleted` tinyint(1) DEFAULT '0' COMMENT '删除标志',
  `created_by` bigint DEFAULT NULL COMMENT '创建人ID',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_by` bigint DEFAULT NULL COMMENT '更新人ID',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`model_id`),
  UNIQUE KEY `uk_model_name` (`model_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='模型配置表';

-- ----------------------------
-- Records of model_config
-- ----------------------------
BEGIN;
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
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='系统配置表';

-- ----------------------------
-- Records of sys_config
-- ----------------------------
BEGIN;
INSERT INTO `sys_config` (`config_id`, `config_name`, `config_key`, `config_value`, `config_type`, `is_system`, `is_sensitive`, `description`, `group_name`, `sort_order`, `is_deleted`, `created_by`, `create_time`, `updated_by`, `update_time`) VALUES (1, '默认模型ID', 'default.model.id', '1', 'number', 0, 0, '系统默认使用的YOLO模型ID', 'model', 0, 0, 1, '2026-01-28 15:07:11', NULL, '2026-01-28 15:07:11');
INSERT INTO `sys_config` (`config_id`, `config_name`, `config_key`, `config_value`, `config_type`, `is_system`, `is_sensitive`, `description`, `group_name`, `sort_order`, `is_deleted`, `created_by`, `create_time`, `updated_by`, `update_time`) VALUES (2, '默认置信度阈值', 'default.conf.threshold', '0.5', 'number', 0, 0, '默认检测置信度阈值', 'detection', 0, 0, 1, '2026-01-28 15:07:11', NULL, '2026-01-28 15:07:11');
INSERT INTO `sys_config` (`config_id`, `config_name`, `config_key`, `config_value`, `config_type`, `is_system`, `is_sensitive`, `description`, `group_name`, `sort_order`, `is_deleted`, `created_by`, `create_time`, `updated_by`, `update_time`) VALUES (3, '默认IOU阈值', 'default.iou.threshold', '0.45', 'number', 0, 0, '默认NMS IOU阈值', 'detection', 0, 0, 1, '2026-01-28 15:07:11', NULL, '2026-01-28 15:07:11');
INSERT INTO `sys_config` (`config_id`, `config_name`, `config_key`, `config_value`, `config_type`, `is_system`, `is_sensitive`, `description`, `group_name`, `sort_order`, `is_deleted`, `created_by`, `create_time`, `updated_by`, `update_time`) VALUES (4, '视频保存路径', 'cap.save.path', '/data/cap', 'string', 0, 0, '检测结果视频保存路径', 'storage', 0, 0, 1, '2026-01-28 15:07:11', NULL, '2026-01-28 15:07:11');
INSERT INTO `sys_config` (`config_id`, `config_name`, `config_key`, `config_value`, `config_type`, `is_system`, `is_sensitive`, `description`, `group_name`, `sort_order`, `is_deleted`, `created_by`, `create_time`, `updated_by`, `update_time`) VALUES (5, '图片保存路径', 'image.save.path', '/data/images', 'string', 0, 0, '检测结果图片保存路径', 'storage', 0, 0, 1, '2026-01-28 15:07:11', NULL, '2026-01-28 15:07:11');
INSERT INTO `sys_config` (`config_id`, `config_name`, `config_key`, `config_value`, `config_type`, `is_system`, `is_sensitive`, `description`, `group_name`, `sort_order`, `is_deleted`, `created_by`, `create_time`, `updated_by`, `update_time`) VALUES (6, '最大文件大小', 'max.file.size.mb', '500', 'number', 0, 0, '最大上传文件大小(MB)', 'upload', 0, 0, 1, '2026-01-28 15:07:11', NULL, '2026-01-28 15:07:11');
INSERT INTO `sys_config` (`config_id`, `config_name`, `config_key`, `config_value`, `config_type`, `is_system`, `is_sensitive`, `description`, `group_name`, `sort_order`, `is_deleted`, `created_by`, `create_time`, `updated_by`, `update_time`) VALUES (7, '允许的文件格式', 'allowed.file.types', 'mp4,avi,jpg,jpeg,png', 'string', 0, 0, '允许上传的文件格式', 'upload', 0, 0, 1, '2026-01-28 15:07:11', NULL, '2026-01-28 15:07:11');
INSERT INTO `sys_config` (`config_id`, `config_name`, `config_key`, `config_value`, `config_type`, `is_system`, `is_sensitive`, `description`, `group_name`, `sort_order`, `is_deleted`, `created_by`, `create_time`, `updated_by`, `update_time`) VALUES (8, '告警启用状态', 'alert.enabled', 'true', 'boolean', 0, 0, '是否启用告警功能', 'alert', 0, 0, 1, '2026-01-28 15:07:11', NULL, '2026-01-28 15:07:11');
INSERT INTO `sys_config` (`config_id`, `config_name`, `config_key`, `config_value`, `config_type`, `is_system`, `is_sensitive`, `description`, `group_name`, `sort_order`, `is_deleted`, `created_by`, `create_time`, `updated_by`, `update_time`) VALUES (9, '低风险阈值', 'alert.low.threshold', '30', 'number', 0, 0, '低风险阈值(%)', 'alert', 0, 0, 1, '2026-01-28 15:07:11', NULL, '2026-01-28 15:07:11');
INSERT INTO `sys_config` (`config_id`, `config_name`, `config_key`, `config_value`, `config_type`, `is_system`, `is_sensitive`, `description`, `group_name`, `sort_order`, `is_deleted`, `created_by`, `create_time`, `updated_by`, `update_time`) VALUES (10, '高风险阈值', 'alert.high.threshold', '70', 'number', 0, 0, '高风险阈值(%)', 'alert', 0, 0, 1, '2026-01-28 15:07:11', NULL, '2026-01-28 15:07:11');
INSERT INTO `sys_config` (`config_id`, `config_name`, `config_key`, `config_value`, `config_type`, `is_system`, `is_sensitive`, `description`, `group_name`, `sort_order`, `is_deleted`, `created_by`, `create_time`, `updated_by`, `update_time`) VALUES (11, '系统名称', 'system.name', 'ClassAI-Edu', 'string', 0, 0, '系统名称', 'system', 0, 0, 1, '2026-01-28 15:07:11', NULL, '2026-01-28 15:07:11');
INSERT INTO `sys_config` (`config_id`, `config_name`, `config_key`, `config_value`, `config_type`, `is_system`, `is_sensitive`, `description`, `group_name`, `sort_order`, `is_deleted`, `created_by`, `create_time`, `updated_by`, `update_time`) VALUES (12, '系统版本', 'system.version', '1.0.0', 'string', 0, 0, '系统版本号', 'system', 0, 0, 1, '2026-01-28 15:07:11', NULL, '2026-01-28 15:07:11');
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
  `browser` varchar(50) DEFAULT '' COMMENT '浏览器类型',
  `os` varchar(50) DEFAULT '' COMMENT '操作系统',
  `status` char(1) DEFAULT '0' COMMENT '登录状态 0=成功 1=失败',
  `msg` varchar(255) DEFAULT '' COMMENT '提示消息',
  `login_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '访问时间',
  `created_by` bigint DEFAULT NULL COMMENT '创建人ID',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_by` bigint DEFAULT NULL COMMENT '更新人ID',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`login_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='登录日志表';

-- ----------------------------
-- Records of sys_login_log
-- ----------------------------
BEGIN;
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='通知公告表';

-- ----------------------------
-- Records of sys_notice
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
  `business_type` int DEFAULT '0' COMMENT '业务类型 0=其它 1=新增 2=修改 3=删除',
  `method` varchar(100) DEFAULT '' COMMENT '方法名称',
  `request_method` varchar(10) DEFAULT '' COMMENT '请求方式',
  `operator_type` int DEFAULT '0' COMMENT '操作类别 0=其它 1=后台用户 2=手机端用户',
  `oper_name` varchar(50) DEFAULT '' COMMENT '操作人员',
  `dept_name` varchar(50) DEFAULT '' COMMENT '部门名称',
  `oper_url` varchar(255) DEFAULT '' COMMENT '请求URL',
  `oper_ip` varchar(128) DEFAULT '' COMMENT '主机地址',
  `oper_location` varchar(255) DEFAULT '' COMMENT '操作地点',
  `oper_param` text COMMENT '请求参数',
  `json_result` text COMMENT '返回参数',
  `status` int DEFAULT '0' COMMENT '操作状态 0=成功 1=失败',
  `error_msg` varchar(2000) DEFAULT '' COMMENT '错误消息',
  `oper_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '操作时间',
  `cost_time` int DEFAULT '0' COMMENT '消耗时间(毫秒)',
  `created_by` bigint DEFAULT NULL COMMENT '创建人ID',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_by` bigint DEFAULT NULL COMMENT '更新人ID',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`oper_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='操作日志表';

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
INSERT INTO `sys_role` (`role_id`, `role_name`, `role_key`, `role_sort`, `data_scope`, `status`, `is_deleted`, `created_by`, `create_time`, `updated_by`, `update_time`, `remark`) VALUES (1, '超级管理员', 'admin', 1, '1', '0', 0, 1, '2026-01-28 15:07:11', NULL, '2026-01-28 15:07:11', NULL);
INSERT INTO `sys_role` (`role_id`, `role_name`, `role_key`, `role_sort`, `data_scope`, `status`, `is_deleted`, `created_by`, `create_time`, `updated_by`, `update_time`, `remark`) VALUES (2, '教师', 'teacher', 2, '1', '0', 0, 1, '2026-01-28 15:07:11', NULL, '2026-01-28 15:07:11', NULL);
INSERT INTO `sys_role` (`role_id`, `role_name`, `role_key`, `role_sort`, `data_scope`, `status`, `is_deleted`, `created_by`, `create_time`, `updated_by`, `update_time`, `remark`) VALUES (3, '学生', 'student', 3, '1', '0', 0, 1, '2026-01-28 15:07:11', NULL, '2026-01-28 15:07:11', NULL);
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
  `sex` char(1) DEFAULT '0' COMMENT '性别 0=男 1=女 2=未知',
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
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='用户表';

-- ----------------------------
-- Records of sys_user
-- ----------------------------
BEGIN;
INSERT INTO `sys_user` (`user_id`, `user_name`, `nick_name`, `email`, `phonenumber`, `sex`, `avatar`, `password`, `status`, `login_ip`, `login_date`, `role_id`, `is_deleted`, `created_by`, `create_time`, `updated_by`, `update_time`, `remark`) VALUES (1, 'admin', '管理员', 'admin@classai.edu', '13800138000', '0', NULL, '0192023a7bbd73250516f069df18b500', '0', NULL, NULL, 1, 0, NULL, '2026-01-28 15:07:11', NULL, '2026-01-28 15:07:11', NULL);
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
  `browser` varchar(50) DEFAULT '' COMMENT '浏览器类型',
  `os` varchar(50) DEFAULT '' COMMENT '操作系统',
  `status` varchar(10) DEFAULT 'on_line' COMMENT '在线状态 on_line/off_line',
  `start_timestamp` datetime DEFAULT CURRENT_TIMESTAMP COMMENT 'session创建时间',
  `last_access_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT 'session最后访问时间',
  `expire_time` int DEFAULT '1800' COMMENT '超时时间(秒)',
  `created_by` bigint DEFAULT NULL COMMENT '创建人ID',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_by` bigint DEFAULT NULL COMMENT '更新人ID',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`session_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='在线用户表';

-- ----------------------------
-- Records of sys_user_online
-- ----------------------------
BEGIN;
COMMIT;

-- ----------------------------
-- Table structure for tracking_record
-- ----------------------------
DROP TABLE IF EXISTS `tracking_record`;
CREATE TABLE `tracking_record` (
  `track_id` bigint NOT NULL AUTO_INCREMENT COMMENT '跟踪记录ID',
  `task_id` bigint NOT NULL COMMENT '任务ID',
  `unique_track_id` int NOT NULL COMMENT '唯一跟踪ID',
  `class_name` varchar(50) NOT NULL COMMENT '类别名称',
  `start_frame` int DEFAULT NULL COMMENT '起始帧',
  `end_frame` int DEFAULT NULL COMMENT '结束帧',
  `start_time` decimal(10,3) DEFAULT NULL COMMENT '起始时间(秒)',
  `end_time` decimal(10,3) DEFAULT NULL COMMENT '结束时间(秒)',
  `duration` decimal(10,3) DEFAULT NULL COMMENT '持续时间(秒)',
  `total_detections` int DEFAULT '0' COMMENT '总检测次数',
  `avg_confidence` decimal(5,4) DEFAULT NULL COMMENT '平均置信度',
  `path_coordinates` text COMMENT '路径坐标JSON',
  `bbox_history` text COMMENT '边界框历史JSON',
  `is_complete` tinyint(1) DEFAULT '0' COMMENT '是否完整',
  `disappear_reason` varchar(100) DEFAULT NULL COMMENT '消失原因',
  `is_deleted` tinyint(1) DEFAULT '0' COMMENT '删除标志',
  `created_by` bigint DEFAULT NULL COMMENT '创建人ID',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_by` bigint DEFAULT NULL COMMENT '更新人ID',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`track_id`),
  UNIQUE KEY `uk_task_track` (`task_id`,`unique_track_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='跟踪记录表';

-- ----------------------------
-- Records of tracking_record
-- ----------------------------
BEGIN;
COMMIT;

SET FOREIGN_KEY_CHECKS = 1;
