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

 Date: 31/01/2026 00:12:07
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
  `user_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='AI检测结果表';

-- ----------------------------
-- Records of class_index_banner
-- ----------------------------
BEGIN;
INSERT INTO `class_index_banner` (`id`, `resource_type`, `resource_url`, `width`, `height`, `fps`, `model_id`, `model_name`, `model_version`, `conf_threshold`, `iou_threshold`, `num_boxes`, `cls_counts`, `max_confidence`, `det_list`, `raw_result`, `status`, `remark`, `is_deleted`, `created_by`, `create_time`, `updated_by`, `update_time`, `user_id`) VALUES (2, 'image', 'http://127.0.0.1:9000/classai-edu/2026/01/29/01a0d7e7-dbfe-42f2-8c94-c5cbe789b530.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=minioadmin%2F20260128%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20260128T185241Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Signature=259125a7928b9cc7410d3f6f694de0685f09f0eb834b587b8e32593aace052e0', 640, 640, NULL, NULL, '/Users/dock4chips/Script-P/classai-edu/model/classai_8n.pt', 'v1.0', 0.5000, 0.4500, 2, '{\"looking_around\": 1, \"sharing_answers\": 1}', 0.5684, '[{\"class_id\": 1, \"bbox_xyxy\": [218.096435546875, 174.35498046875, 318.198974609375, 334.42449951171875], \"bbox_xywhn\": [0.41898077726364136, 0.3974839746952057, 0.15641021728515625, 0.25010862946510315], \"class_name\": \"looking_around\", \"confidence\": 0.56842041015625, \"class_index\": 1}, {\"class_id\": 2, \"bbox_xyxy\": [315.36724853515625, 395.94000244140625, 423.1008911132813, 549.835693359375], \"bbox_xywhn\": [0.5769282579421997, 0.7388872504234314, 0.16833381354808807, 0.2404620200395584], \"class_name\": \"sharing_answers\", \"confidence\": 0.5424467325210571, \"class_index\": 2}]', '{\"det_list\": [{\"class_id\": 1, \"bbox_xyxy\": [218.096435546875, 174.35498046875, 318.198974609375, 334.42449951171875], \"bbox_xywhn\": [0.41898077726364136, 0.3974839746952057, 0.15641021728515625, 0.25010862946510315], \"class_name\": \"looking_around\", \"confidence\": 0.56842041015625}, {\"class_id\": 2, \"bbox_xyxy\": [315.36724853515625, 395.94000244140625, 423.1008911132813, 549.835693359375], \"bbox_xywhn\": [0.5769282579421997, 0.7388872504234314, 0.16833381354808807, 0.2404620200395584], \"class_name\": \"sharing_answers\", \"confidence\": 0.5424467325210571}], \"image_url\": \"http://127.0.0.1:9000/classai-edu/2026/01/29/01a0d7e7-dbfe-42f2-8c94-c5cbe789b530.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=minioadmin%2F20260128%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20260128T185241Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Signature=259125a7928b9cc7410d3f6f694de0685f09f0eb834b587b8e32593aace052e0\", \"num_detections\": 2}', 1, NULL, 0, NULL, '2026-01-28 18:52:41', NULL, '2026-01-28 18:52:41', NULL);
INSERT INTO `class_index_banner` (`id`, `resource_type`, `resource_url`, `width`, `height`, `fps`, `model_id`, `model_name`, `model_version`, `conf_threshold`, `iou_threshold`, `num_boxes`, `cls_counts`, `max_confidence`, `det_list`, `raw_result`, `status`, `remark`, `is_deleted`, `created_by`, `create_time`, `updated_by`, `update_time`, `user_id`) VALUES (3, 'image', 'http://127.0.0.1:9000/classai-edu/2026/01/29/8b21bdd4-7190-455b-b684-440e60cdef1c.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=minioadmin%2F20260128%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20260128T185351Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Signature=5864b8e2fcd88aa48b26c7c8fe14be55f2e53d0582c1992dc6dbe3ed49cc2321', 640, 640, NULL, NULL, '/Users/dock4chips/Script-P/classai-edu/model/classai_8n.pt', 'v1.0', 0.5000, 0.4500, 1, '{\"looking_around\": 1}', 0.6104, '[{\"class_id\": 1, \"bbox_xyxy\": [527.0543212890625, 323.5989685058594, 566.8311767578125, 392.9870910644531], \"bbox_xywhn\": [0.8545980453491211, 0.5598328709602356, 0.06215133517980576, 0.10841894149780272], \"class_name\": \"looking_around\", \"confidence\": 0.6103976368904114, \"class_index\": 1}]', '{\"det_list\": [{\"class_id\": 1, \"bbox_xyxy\": [527.0543212890625, 323.5989685058594, 566.8311767578125, 392.9870910644531], \"bbox_xywhn\": [0.8545980453491211, 0.5598328709602356, 0.06215133517980576, 0.10841894149780272], \"class_name\": \"looking_around\", \"confidence\": 0.6103976368904114}], \"image_url\": \"http://127.0.0.1:9000/classai-edu/2026/01/29/8b21bdd4-7190-455b-b684-440e60cdef1c.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=minioadmin%2F20260128%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20260128T185351Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Signature=5864b8e2fcd88aa48b26c7c8fe14be55f2e53d0582c1992dc6dbe3ed49cc2321\", \"num_detections\": 1}', 1, NULL, 0, NULL, '2026-01-28 18:53:51', NULL, '2026-01-28 18:53:51', NULL);
INSERT INTO `class_index_banner` (`id`, `resource_type`, `resource_url`, `width`, `height`, `fps`, `model_id`, `model_name`, `model_version`, `conf_threshold`, `iou_threshold`, `num_boxes`, `cls_counts`, `max_confidence`, `det_list`, `raw_result`, `status`, `remark`, `is_deleted`, `created_by`, `create_time`, `updated_by`, `update_time`, `user_id`) VALUES (4, 'image', 'http://127.0.0.1:9000/classai-edu/2026/01/29/448ae32d-af1d-463c-9be5-48328e32a727.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=minioadmin%2F20260128%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20260128T185440Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Signature=d12906b8b137d88e9c50fa94d4ad35e60053a7f5772380f9fbd424b3a96f020d', 640, 640, NULL, NULL, '/Users/dock4chips/Script-P/classai-edu/model/classai_8n.pt', 'v1.0', 0.5000, 0.4500, 1, '{\"sleeping\": 1}', 0.8123, '[{\"class_id\": 3, \"bbox_xyxy\": [169.5384521484375, 125.32171630859376, 539.57373046875, 640.0], \"bbox_xywhn\": [0.5539938807487488, 0.5979076027870178, 0.5781801342964172, 0.8041847944259644], \"class_name\": \"sleeping\", \"confidence\": 0.812319815158844, \"class_index\": 3}]', '{\"det_list\": [{\"class_id\": 3, \"bbox_xyxy\": [169.5384521484375, 125.32171630859376, 539.57373046875, 640.0], \"bbox_xywhn\": [0.5539938807487488, 0.5979076027870178, 0.5781801342964172, 0.8041847944259644], \"class_name\": \"sleeping\", \"confidence\": 0.812319815158844}], \"image_url\": \"http://127.0.0.1:9000/classai-edu/2026/01/29/448ae32d-af1d-463c-9be5-48328e32a727.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=minioadmin%2F20260128%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20260128T185440Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Signature=d12906b8b137d88e9c50fa94d4ad35e60053a7f5772380f9fbd424b3a96f020d\", \"num_detections\": 1}', 1, NULL, 0, NULL, '2026-01-28 18:54:40', NULL, '2026-01-28 18:54:40', NULL);
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
  `business_type` int DEFAULT '0' COMMENT '业务类型 0=其它 1=新增 2=修改 3=删除 4=查询',
  `method` varchar(100) DEFAULT '' COMMENT '方法名称',
  `request_method` varchar(10) DEFAULT '' COMMENT '请求方式',
  `oper_user_id` bigint DEFAULT NULL COMMENT '操作人员',
  `oper_url` varchar(255) DEFAULT '' COMMENT '请求URL',
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
  PRIMARY KEY (`oper_id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='操作日志表';

-- ----------------------------
-- Records of sys_oper_log
-- ----------------------------
BEGIN;
INSERT INTO `sys_oper_log` (`oper_id`, `title`, `business_type`, `method`, `request_method`, `oper_user_id`, `oper_url`, `oper_ip`, `oper_location`, `oper_param`, `json_result`, `status`, `error_msg`, `cost_time`, `created_by`, `create_time`, `updated_by`, `update_time`) VALUES (6, 'http', 4, 'list_class_index_banner', 'GET', NULL, 'http://localhost:7869/api/class/index/banner', '127.0.0.1', '127.0.0.1', '{}', '[{\"id\": 4, \"resource_type\": \"image\", \"resource_url\": \"http://127.0.0.1:9000/classai-edu/2026/01/29/448ae32d-af1d-463c-9be5-48328e32a727.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=minioadmin%2F20260128%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20260128T185440Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Signature=d12906b8b137d88e9c50fa94d4ad35e60053a7f5772380f9fbd424b3a96f020d\", \"width\": 640, \"height\": 640, \"fps\": null, \"model_id\": null, \"model_name\": \"/Users/dock4chips/Script-P/classai-edu/model/classai_8n.pt\", \"model_version\": \"v1.0\", \"conf_threshold\": 0.5, \"iou_threshold\": 0.45, \"num_boxes\": 1, \"cls_counts\": \"{\\\"sleeping\\\": 1}\", \"max_confidence\": 0.8123, \"det_list\": \"[{\\\"class_id\\\": 3, \\\"bbox_xyxy\\\": [169.5384521484375, 125.32171630859376, 539.57373046875, 640.0], \\\"bbox_xywhn\\\": [0.5539938807487488, 0.5979076027870178, 0.5781801342964172, 0.8041847944259644], \\\"class_name\\\": \\\"sleeping\\\", \\\"confidence\\\": 0.812319815158844, \\\"class_index\\\": 3}]\", \"raw_result\": \"{\\\"det_list\\\": [{\\\"class_id\\\": 3, \\\"bbox_xyxy\\\": [169.5384521484375, 125.32171630859376, 539.57373046875, 640.0], \\\"bbox_xywhn\\\": [0.5539938807487488, 0.5979076027870178, 0.5781801342964172, 0.8041847944259644], \\\"class_name\\\": \\\"sleeping\\\", \\\"confidence\\\": 0.812319815158844}], \\\"image_url\\\": \\\"http://127.0.0.1:9000/classai-edu/2026/01/29/448ae32d-af1d-463c-9be5-48328e32a727.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=minioadmin%2F20260128%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20260128T185440Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Signature=d12906b8b137d88e9c50fa94d4ad35e60053a7f5772380f9fbd424b3a96f020d\\\", \\\"num_detections\\\": 1}\", \"status\": 1, \"remark\": null, \"is_deleted\": 0, \"created_by\": null, \"create_time\": \"2026-01-28T18:54:40\", \"updated_by\": null, \"update_time\": \"2026-01-28T18:54:40\", \"user_id\": null}, {\"id\": 3, \"resource_type\": \"image\", \"resource_url\": \"http://127.0.0.1:9000/classai-edu/2026/01/29/8b21bdd4-7190-455b-b684-440e60cdef1c.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=minioadmin%2F20260128%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20260128T185351Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Signature=5864b8e2fcd88aa48b26c7c8fe14be55f2e53d0582c1992dc6dbe3ed49cc2321\", \"width\": 640, \"height\": 640, \"fps\": null, \"model_id\": null, \"model_name\": \"/Users/dock4chips/Script-P/classai-edu/model/classai_8n.pt\", \"model_version\": \"v1.0\", \"conf_threshold\": 0.5, \"iou_threshold\": 0.45, \"num_boxes\": 1, \"cls_counts\": \"{\\\"looking_around\\\": 1}\", \"max_confidence\": 0.6104, \"det_list\": \"[{\\\"class_id\\\": 1, \\\"bbox_xyxy\\\": [527.0543212890625, 323.5989685058594, 566.8311767578125, 392.9870910644531], \\\"bbox_xywhn\\\": [0.8545980453491211, 0.5598328709602356, 0.06215133517980576, 0.10841894149780272], \\\"class_name\\\": \\\"looking_around\\\", \\\"confidence\\\": 0.6103976368904114, \\\"class_index\\\": 1}]\", \"raw_result\": \"{\\\"det_list\\\": [{\\\"class_id\\\": 1, \\\"bbox_xyxy\\\": [527.0543212890625, 323.5989685058594, 566.8311767578125, 392.9870910644531], \\\"bbox_xywhn\\\": [0.8545980453491211, 0.5598328709602356, 0.06215133517980576, 0.10841894149780272], \\\"class_name\\\": \\\"looking_around\\\", \\\"confidence\\\": 0.6103976368904114}], \\\"image_url\\\": \\\"http://127.0.0.1:9000/classai-edu/2026/01/29/8b21bdd4-7190-455b-b684-440e60cdef1c.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=minioadmin%2F20260128%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20260128T185351Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Signature=5864b8e2fcd88aa48b26c7c8fe14be55f2e53d0582c1992dc6dbe3ed49cc2321\\\", \\\"num_detections\\\": 1}\", \"status\": 1, \"remark\": null, \"is_deleted\": 0, \"created_by\": null, \"create_time\": \"2026-01-28T18:53:51\", \"updated_by\": null, \"update_time\": \"2026-01-28T18:53:51\", \"user_id\": null}, {\"id\": 2, \"resource_type\": \"image\", \"resource_url\": \"http://127.0.0.1:9000/classai-edu/2026/01/29/01a0d7e7-dbfe-42f2-8c94-c5cbe789b530.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=minioadmin%2F20260128%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20260128T185241Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Signature=259125a7928b9cc7410d3f6f694de0685f09f0eb834b587b8e32593aace052e0\", \"width\": 640, \"height\": 640, \"fps\": null, \"model_id\": null, \"model_name\": \"/Users/dock4chips/Script-P/classai-edu/model/classai_8n.pt\", \"model_version\": \"v1.0\", \"conf_threshold\": 0.5, \"iou_threshold\": 0.45, \"num_boxes\": 2, \"cls_counts\": \"{\\\"looking_around\\\": 1, \\\"sharing_answers\\\": 1}\", \"max_confidence\": 0.5684, \"det_list\": \"[{\\\"class_id\\\": 1, \\\"bbox_xyxy\\\": [218.096435546875, 174.35498046875, 318.198974609375, 334.42449951171875], \\\"bbox_xywhn\\\": [0.41898077726364136, 0.3974839746952057, 0.15641021728515625, 0.25010862946510315], \\\"class_name\\\": \\\"looking_around\\\", \\\"confidence\\\": 0.56842041015625, \\\"class_index\\\": 1}, {\\\"class_id\\\": 2, \\\"bbox_xyxy\\\": [315.36724853515625, 395.94000244140625, 423.1008911132813, 549.835693359375], \\\"bbox_xywhn\\\": [0.5769282579421997, 0.7388872504234314, 0.16833381354808807, 0.2404620200395584], \\\"class_name\\\": \\\"sharing_answers\\\", \\\"confidence\\\": 0.5424467325210571, \\\"class_index\\\": 2}]\", \"raw_result\": \"{\\\"det_list\\\": [{\\\"class_id\\\": 1, \\\"bbox_xyxy\\\": [218.096435546875, 174.35498046875, 318.198974609375, 334.42449951171875], \\\"bbox_xywhn\\\": [0.41898077726364136, 0.3974839746952057, 0.15641021728515625, 0.25010862946510315], \\\"class_name\\\": \\\"looking_around\\\", \\\"confidence\\\": 0.56842041015625}, {\\\"class_id\\\": 2, \\\"bbox_xyxy\\\": [315.36724853515625, 395.94000244140625, 423.1008911132813, 549.835693359375], \\\"bbox_xywhn\\\": [0.5769282579421997, 0.7388872504234314, 0.16833381354808807, 0.2404620200395584], \\\"class_name\\\": \\\"sharing_answers\\\", \\\"confidence\\\": 0.5424467325210571}], \\\"image_url\\\": \\\"http://127.0.0.1:9000/classai-edu/2026/01/29/01a0d7e7-dbfe-42f2-8c94-c5cbe789b530.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=minioadmin%2F20260128%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20260128T185241Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Signature=259125a7928b9cc7410d3f6f694de0685f09f0eb834b587b8e32593aace052e0\\\", \\\"num_detections\\\": 2}\", \"status\": 1, \"remark\": null, \"is_deleted\": 0, \"created_by\": null, \"create_time\": \"2026-01-28T18:52:41\", \"updated_by\": null, \"update_time\": \"2026-01-28T18:52:41\", \"user_id\": null}]', 0, '', 1372, NULL, '2026-01-30 14:19:08', NULL, '2026-01-30 14:19:08');
INSERT INTO `sys_oper_log` (`oper_id`, `title`, `business_type`, `method`, `request_method`, `oper_user_id`, `oper_url`, `oper_ip`, `oper_location`, `oper_param`, `json_result`, `status`, `error_msg`, `cost_time`, `created_by`, `create_time`, `updated_by`, `update_time`) VALUES (7, 'http', 4, 'get_captcha', 'GET', NULL, 'http://localhost:7869/api/strategies/identity/captcha', '127.0.0.1', '127.0.0.1', '{}', '{\"uuid_img\": \"17d3c525-13d8-42c1-bf1a-3a252401fb19\", \"image\": \"data:image/png;base64,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\"}', 0, '', 35, NULL, '2026-01-30 16:01:43', NULL, '2026-01-30 16:01:43');
INSERT INTO `sys_oper_log` (`oper_id`, `title`, `business_type`, `method`, `request_method`, `oper_user_id`, `oper_url`, `oper_ip`, `oper_location`, `oper_param`, `json_result`, `status`, `error_msg`, `cost_time`, `created_by`, `create_time`, `updated_by`, `update_time`) VALUES (8, 'http', 4, 'list_sys_user', 'GET', 1, 'http://localhost:7869/api/sys/user/list?user_name=admin', '127.0.0.1', '127.0.0.1', '{\"user_name\": \"admin\"}', '{\"records\": [{\"user_id\": 1, \"user_name\": \"admin\", \"nick_name\": \"管理员\", \"email\": \"admin@classai.edu\", \"phonenumber\": \"13800138000\", \"sex\": \"0\", \"avatar\": null, \"status\": \"0\", \"login_ip\": null, \"login_date\": null, \"role_id\": 1, \"is_deleted\": 0, \"created_by\": null, \"create_time\": \"2026-01-28T15:07:11\", \"updated_by\": null, \"update_time\": \"2026-01-28T19:04:39\", \"remark\": null}], \"total\": 1, \"page\": 1, \"page_size\": 10}', 0, '', 12, 1, '2026-01-30 16:02:07', 1, '2026-01-30 16:02:07');
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
INSERT INTO `sys_role` (`role_id`, `role_name`, `role_key`, `role_sort`, `data_scope`, `status`, `is_deleted`, `created_by`, `create_time`, `updated_by`, `update_time`, `remark`) VALUES (2, '教师', 'teacher', 2, '1', '0', 0, 1, '2026-01-28 15:07:11', NULL, '2026-01-29 08:19:50', NULL);
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
INSERT INTO `sys_user` (`user_id`, `user_name`, `nick_name`, `email`, `phonenumber`, `sex`, `avatar`, `password`, `status`, `login_ip`, `login_date`, `role_id`, `is_deleted`, `created_by`, `create_time`, `updated_by`, `update_time`, `remark`) VALUES (1, 'admin', '管理员', 'admin@classai.edu', '13800138000', '0', NULL, 'e10adc3949ba59abbe56e057f20f883e', '0', NULL, NULL, 1, 0, NULL, '2026-01-28 15:07:11', NULL, '2026-01-28 19:04:39', NULL);
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
