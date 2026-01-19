/*
 ClassAI-Edu 数据库设计
 基于 YOLOv8 的课堂行为检测系统

 Target Server Type    : MySQL
 Target Server Version : 80034 (8.0.34)
 File Encoding         : 65001

 Date: 20/01/2026
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- =============================
-- 系统管理模块
-- =============================

-- ----------------------------
-- Table structure for sys_user
-- ----------------------------
DROP TABLE IF EXISTS `sys_user`;
CREATE TABLE `sys_user` (
  `user_id` bigint NOT NULL AUTO_INCREMENT COMMENT '用户ID',
  `user_name` varchar(30) NOT NULL COMMENT '用户账号',
  `nick_name` varchar(30) DEFAULT NULL COMMENT '用户昵称',
  `email` varchar(50) DEFAULT '' COMMENT '用户邮箱',
  `phonenumber` varchar(11) DEFAULT '' COMMENT '手机号码',
  `sex` char(1) DEFAULT '0' COMMENT '用户性别（0男 1女 2未知）',
  `avatar` varchar(255) DEFAULT '' COMMENT '头像地址',
  `password` varchar(100) NOT NULL DEFAULT '' COMMENT '密码',
  `status` char(1) DEFAULT '0' COMMENT '账号状态（0正常 1停用）',
  `del_flag` char(1) DEFAULT '0' COMMENT '删除标志（0代表存在 2代表删除）',
  `login_ip` varchar(128) DEFAULT '' COMMENT '最后登录IP',
  `login_date` datetime DEFAULT NULL COMMENT '最后登录时间',
  `pwd_update_date` datetime DEFAULT NULL COMMENT '密码最后更新时间',
  `create_by` varchar(64) DEFAULT '' COMMENT '创建者',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_by` varchar(64) DEFAULT '' COMMENT '更新者',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `remark` varchar(500) DEFAULT NULL COMMENT '备注',
  PRIMARY KEY (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=100 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='用户信息表';

-- ----------------------------
-- Table structure for sys_role
-- ----------------------------
DROP TABLE IF EXISTS `sys_role`;
CREATE TABLE `sys_role` (
  `role_id` bigint NOT NULL AUTO_INCREMENT COMMENT '角色ID',
  `role_name` varchar(30) NOT NULL COMMENT '角色名称',
  `role_key` varchar(100) NOT NULL COMMENT '角色权限字符串',
  `role_sort` int NOT NULL COMMENT '显示顺序',
  `status` char(1) NOT NULL DEFAULT '0' COMMENT '角色状态（0正常 1停用）',
  `del_flag` char(1) DEFAULT '0' COMMENT '删除标志（0代表存在 2代表删除）',
  `create_by` varchar(64) DEFAULT '' COMMENT '创建者',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_by` varchar(64) DEFAULT '' COMMENT '更新者',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `remark` varchar(500) DEFAULT NULL COMMENT '备注',
  PRIMARY KEY (`role_id`)
) ENGINE=InnoDB AUTO_INCREMENT=100 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='角色信息表';

-- ----------------------------
-- Table structure for sys_user_role
-- ----------------------------
DROP TABLE IF EXISTS `sys_user_role`;
CREATE TABLE `sys_user_role` (
  `user_id` bigint NOT NULL COMMENT '用户ID',
  `role_id` bigint NOT NULL COMMENT '角色ID',
  PRIMARY KEY (`user_id`,`role_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='用户和角色关联表';

-- ----------------------------
-- Table structure for sys_login_log
-- ----------------------------
DROP TABLE IF EXISTS `sys_login_log`;
CREATE TABLE `sys_login_log` (
  `info_id` bigint NOT NULL AUTO_INCREMENT COMMENT '访问ID',
  `user_name` varchar(50) DEFAULT '' COMMENT '用户账号',
  `ipaddr` varchar(128) DEFAULT '' COMMENT '登录IP地址',
  `login_location` varchar(255) DEFAULT '' COMMENT '登录地点',
  `browser` varchar(50) DEFAULT '' COMMENT '浏览器类型',
  `os` varchar(50) DEFAULT '' COMMENT '操作系统',
  `status` char(1) DEFAULT '0' COMMENT '登录状态（0成功 1失败）',
  `msg` varchar(255) DEFAULT '' COMMENT '提示消息',
  `login_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '访问时间',
  PRIMARY KEY (`info_id`)
) ENGINE=InnoDB AUTO_INCREMENT=100 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='系统登录日志';

-- ----------------------------
-- Table structure for sys_oper_log
-- ----------------------------
DROP TABLE IF EXISTS `sys_oper_log`;
CREATE TABLE `sys_oper_log` (
  `oper_id` bigint NOT NULL AUTO_INCREMENT COMMENT '日志主键',
  `title` varchar(50) DEFAULT '' COMMENT '模块标题',
  `business_type` int DEFAULT '0' COMMENT '业务类型（0其它 1新增 2修改 3删除 4查询 5导入 6导出）',
  `method` varchar(200) DEFAULT '' COMMENT '方法名称',
  `request_method` varchar(10) DEFAULT '' COMMENT '请求方式',
  `operator_type` int DEFAULT '0' COMMENT '操作类别（0其它 1后台用户 2手机端用户）',
  `oper_name` varchar(50) DEFAULT '' COMMENT '操作人员',
  `oper_url` varchar(255) DEFAULT '' COMMENT '请求URL',
  `oper_ip` varchar(128) DEFAULT '' COMMENT '主机地址',
  `oper_location` varchar(255) DEFAULT '' COMMENT '操作地点',
  `oper_param` text COMMENT '请求参数',
  `json_result` text COMMENT '返回参数',
  `status` int DEFAULT '0' COMMENT '操作状态（0正常 1异常）',
  `error_msg` varchar(2000) DEFAULT '' COMMENT '错误消息',
  `oper_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '操作时间',
  `cost_time` bigint DEFAULT '0' COMMENT '消耗时间（毫秒）',
  PRIMARY KEY (`oper_id`)
) ENGINE=InnoDB AUTO_INCREMENT=100 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='操作日志记录';

-- ----------------------------
-- Table structure for sys_config
-- ----------------------------
DROP TABLE IF EXISTS `sys_config`;
CREATE TABLE `sys_config` (
  `config_id` bigint NOT NULL AUTO_INCREMENT COMMENT '参数主键',
  `config_name` varchar(100) DEFAULT '' COMMENT '参数名称',
  `config_key` varchar(100) DEFAULT '' COMMENT '参数键名',
  `config_value` varchar(500) DEFAULT '' COMMENT '参数键值',
  `config_type` char(1) DEFAULT 'N' COMMENT '系统内置（Y是 N否）',
  `status` char(1) DEFAULT '0' COMMENT '状态（0正常 1停用）',
  `create_by` varchar(64) DEFAULT '' COMMENT '创建者',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_by` varchar(64) DEFAULT '' COMMENT '更新者',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `remark` varchar(500) DEFAULT NULL COMMENT '备注',
  PRIMARY KEY (`config_id`)
) ENGINE=InnoDB AUTO_INCREMENT=100 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='系统配置表';

-- =============================
-- 检测任务模块
-- =============================

-- ----------------------------
-- Table structure for ai_detection_task
-- ----------------------------
DROP TABLE IF EXISTS `ai_detection_task`;
CREATE TABLE `ai_detection_task` (
  `task_id` bigint NOT NULL AUTO_INCREMENT COMMENT '任务ID',
  `user_id` bigint NOT NULL COMMENT '用户ID',
  `task_name` varchar(100) DEFAULT NULL COMMENT '任务名称',
  `file_type` varchar(20) NOT NULL COMMENT '文件类型（image图片 video视频 stream直播流）',
  `original_url` text COMMENT '原始文件URL',
  `file_size` bigint DEFAULT NULL COMMENT '文件大小（字节）',
  `file_duration` int DEFAULT NULL COMMENT '文件时长（秒，视频/直播流用）',
  `file_width` int DEFAULT NULL COMMENT '文件宽度（像素）',
  `file_height` int DEFAULT NULL COMMENT '文件高度（像素）',
  `confidence_threshold` decimal(5,4) DEFAULT '0.5000' COMMENT '置信度阈值',
  `iou_threshold` decimal(5,4) DEFAULT '0.4500' COMMENT 'IOU阈值',
  `status` char(1) DEFAULT '0' COMMENT '状态（0待处理 1处理中 2已完成 3失败）',
  `progress` int DEFAULT '0' COMMENT '处理进度（0-100）',
  `error_msg` varchar(500) DEFAULT NULL COMMENT '错误信息',
  `start_time` datetime DEFAULT NULL COMMENT '开始处理时间',
  `end_time` datetime DEFAULT NULL COMMENT '结束处理时间',
  `cost_time` int DEFAULT NULL COMMENT '处理耗时（毫秒）',
  `result_image_url` text COMMENT '检测结果图片URL',
  `result_video_url` text COMMENT '检测结果视频URL',
  `total_detections` int DEFAULT '0' COMMENT '总检测数量',
  `detection_summary` json DEFAULT NULL COMMENT '检测摘要（各行为统计）',
  `create_by` varchar(64) DEFAULT '' COMMENT '创建者',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_by` varchar(64) DEFAULT '' COMMENT '更新者',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `remark` varchar(500) DEFAULT NULL COMMENT '备注',
  PRIMARY KEY (`task_id`)
) ENGINE=InnoDB AUTO_INCREMENT=1000 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='AI检测任务表';

-- ----------------------------
-- Table structure for ai_detection_record
-- ----------------------------
DROP TABLE IF EXISTS `ai_detection_record`;
CREATE TABLE `ai_detection_record` (
  `record_id` bigint NOT NULL AUTO_INCREMENT COMMENT '记录ID',
  `task_id` bigint NOT NULL COMMENT '任务ID',
  `frame_number` int DEFAULT NULL COMMENT '帧编号（视频检测用）',
  `timestamp` decimal(10,3) DEFAULT NULL COMMENT '时间戳（秒，视频检测用）',
  `behavior_class` varchar(50) NOT NULL COMMENT '行为类别（looking_around/sharing_answers/sleeping/leaning_to_copy）',
  `behavior_name` varchar(100) DEFAULT NULL COMMENT '行为名称',
  `confidence` decimal(5,4) NOT NULL COMMENT '置信度（0-1）',
  `bbox_x` int NOT NULL COMMENT '边界框X坐标',
  `bbox_y` int NOT NULL COMMENT '边界框Y坐标',
  `bbox_width` int NOT NULL COMMENT '边界框宽度',
  `bbox_height` int NOT NULL COMMENT '边界框高度',
  `area` int DEFAULT NULL COMMENT '区域面积',
  `is_abnormal` char(1) DEFAULT '0' COMMENT '是否异常（0正常 1异常）',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `remark` varchar(500) DEFAULT NULL COMMENT '备注',
  PRIMARY KEY (`record_id`)
) ENGINE=InnoDB AUTO_INCREMENT=100000 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='AI检测记录表';

-- ----------------------------
-- Table structure for ai_detection_statistics
-- ----------------------------
DROP TABLE IF EXISTS `ai_detection_statistics`;
CREATE TABLE `ai_detection_statistics` (
  `stat_id` bigint NOT NULL AUTO_INCREMENT COMMENT '统计ID',
  `task_id` bigint NOT NULL COMMENT '任务ID',
  `behavior_class` varchar(50) NOT NULL COMMENT '行为类别',
  `behavior_name` varchar(100) DEFAULT NULL COMMENT '行为名称',
  `count` int DEFAULT '0' COMMENT '检测次数',
  `avg_confidence` decimal(5,4) DEFAULT NULL COMMENT '平均置信度',
  `max_confidence` decimal(5,4) DEFAULT NULL COMMENT '最大置信度',
  `min_confidence` decimal(5,4) DEFAULT NULL COMMENT '最小置信度',
  `first_detected_time` datetime DEFAULT NULL COMMENT '首次检测时间',
  `last_detected_time` datetime DEFAULT NULL COMMENT '最后检测时间',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`stat_id`)
) ENGINE=InnoDB AUTO_INCREMENT=10000 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='AI检测统计表';

-- ----------------------------
-- Table structure for ai_behavior_config
-- ----------------------------
DROP TABLE IF EXISTS `ai_behavior_config`;
CREATE TABLE `ai_behavior_config` (
  `config_id` bigint NOT NULL AUTO_INCREMENT COMMENT '配置ID',
  `behavior_class` varchar(50) NOT NULL COMMENT '行为类别（英文标识）',
  `behavior_name` varchar(100) NOT NULL COMMENT '行为名称',
  `description` varchar(500) DEFAULT NULL COMMENT '行为描述',
  `color` varchar(20) DEFAULT NULL COMMENT '标注颜色（十六进制）',
  `display_order` int DEFAULT '0' COMMENT '显示顺序',
  `enabled` char(1) DEFAULT '1' COMMENT '是否启用（0禁用 1启用）',
  `alert_enabled` char(1) DEFAULT '0' COMMENT '是否告警（0否 1是）',
  `alert_threshold` int DEFAULT '10' COMMENT '告警阈值（次数）',
  `severity` char(1) DEFAULT '2' COMMENT '严重程度（1高 2中 3低）',
  `create_by` varchar(64) DEFAULT '' COMMENT '创建者',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_by` varchar(64) DEFAULT '' COMMENT '更新者',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `remark` varchar(500) DEFAULT NULL COMMENT '备注',
  PRIMARY KEY (`config_id`)
) ENGINE=InnoDB AUTO_INCREMENT=100 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='AI行为配置表';

-- ----------------------------
-- Table structure for ai_file_history
-- ----------------------------
DROP TABLE IF EXISTS `ai_file_history`;
CREATE TABLE `ai_file_history` (
  `file_id` bigint NOT NULL AUTO_INCREMENT COMMENT '文件ID',
  `user_id` bigint NOT NULL COMMENT '用户ID',
  `file_name` varchar(255) NOT NULL COMMENT '文件名',
  `file_type` varchar(20) NOT NULL COMMENT '文件类型（image/video）',
  `file_size` bigint DEFAULT NULL COMMENT '文件大小（字节）',
  `file_format` varchar(20) DEFAULT NULL COMMENT '文件格式（jpg/png/mp4等）',
  `storage_path` text COMMENT '存储路径',
  `file_url` text COMMENT '文件URL',
  `thumbnail_url` text COMMENT '缩略图URL',
  `upload_ip` varchar(128) DEFAULT NULL COMMENT '上传IP',
  `status` char(1) DEFAULT '0' COMMENT '状态（0正常 1删除）',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '上传时间',
  `remark` varchar(500) DEFAULT NULL COMMENT '备注',
  PRIMARY KEY (`file_id`)
) ENGINE=InnoDB AUTO_INCREMENT=10000 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='文件上传历史表';

-- ----------------------------
-- Table structure for ai_index_banner
-- ----------------------------
DROP TABLE IF EXISTS `ai_index_banner`;
CREATE TABLE `ai_index_banner` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '轮播图ID',
  `user_id` bigint NOT NULL COMMENT '所属用户ID',
  `task_id` bigint DEFAULT NULL COMMENT '关联的检测任务ID',
  `title` varchar(100) DEFAULT NULL COMMENT '标题',
  `original_image_url` text NOT NULL COMMENT '原始图片URL',
  `result_image_url` text COMMENT '标注后的图片URL',
  `thumbnail_url` text COMMENT '缩略图URL',
  `num_boxes` int DEFAULT '0' COMMENT '检测到的框数量',
  `total_detections` int DEFAULT '0' COMMENT '总检测数量',
  `violation_count` int DEFAULT '0' COMMENT '违规行为数量',
  `cls_counts` json DEFAULT NULL COMMENT '分类统计信息（JSON格式）',
  `display_order` int DEFAULT '0' COMMENT '显示顺序（数字越小越靠前）',
  `is_active` char(1) DEFAULT '1' COMMENT '是否启用（0禁用 1启用）',
  `view_count` int DEFAULT '0' COMMENT '查看次数',
  `create_by` varchar(64) DEFAULT '' COMMENT '创建者',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_by` varchar(64) DEFAULT '' COMMENT '更新者',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `remark` varchar(500) DEFAULT NULL COMMENT '备注',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=100 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='首页轮播图表';

-- =============================
-- 初始化数据
-- =============================

-- ----------------------------
-- 初始化系统配置
-- ----------------------------
INSERT INTO `sys_config` (`config_name`, `config_key`, `config_value`, `config_type`, `status`, `remark`) VALUES
('用户登录-验证码开关', 'sys.account.captchaEnabled', 'true', 'Y', '0', '是否开启验证码功能（true开启 false关闭）'),
('AI检测-默认置信度阈值', 'ai.detection.defaultConfidence', '0.5', 'Y', '0', 'AI检测默认置信度阈值（0-1）'),
('AI检测-默认IOU阈值', 'ai.detection.defaultIou', '0.45', 'Y', '0', 'AI检测默认IOU阈值（0-1）'),
('文件上传-最大文件大小', 'file.upload.maxSize', '104857600', 'Y', '0', '文件上传最大大小（字节，默认100MB）'),
('文件上传-允许的图片格式', 'file.upload.imageFormats', 'jpg,jpeg,png,bmp,webp', 'Y', '0', '允许上传的图片格式'),
('文件上传-允许的视频格式', 'file.upload.videoFormats', 'mp4,avi,mov,mkv,flv', 'Y', '0', '允许上传的视频格式');

-- ----------------------------
-- 初始化AI行为配置
-- ----------------------------
INSERT INTO `ai_behavior_config` (`behavior_class`, `behavior_name`, `description`, `color`, `display_order`, `enabled`, `alert_enabled`, `alert_threshold`, `severity`, `remark`) VALUES
('staff', '工作人员', '课堂上的工作人员或管理人员', '#00FF00', 0, '1', '0', 999, '3', '正常行为，非违规'),
('learning_to_copy', '试图抄袭', '学生A查看学生B的答案，但B不知道', '#FF0000', 1, '1', '1', 5, '1', '严重违规行为'),
('looking_around', '东张西望', '学生在课堂上四处张望，注意力不集中', '#FFA500', 2, '1', '0', 50, '3', '轻度违规行为'),
('using_mobile', '使用电子设备', '学生在课堂上使用手机或其他电子设备', '#FF69B4', 3, '1', '1', 10, '2', '中度违规行为'),
('sharing_answers', '分享答案', '学生A查看学生B的答案，B知道并配合', '#DC143C', 4, '1', '1', 5, '1', '严重违规行为'),
('sleeping', '睡觉', '学生在课堂上睡觉', '#FFFF00', 5, '1', '1', 10, '2', '中度违规行为');

-- ----------------------------
-- 初始化管理员用户
-- ----------------------------
INSERT INTO `sys_user` (`user_id`, `user_name`, `nick_name`, `email`, `phonenumber`, `sex`, `avatar`, `password`, `status`, `remark`) VALUES
(1, 'admin', '超级管理员', 'admin@classai.com', '13800138000', '0', '', '$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2', '0', '系统管理员');

-- ----------------------------
-- 初始化角色
-- ----------------------------
INSERT INTO `sys_role` (`role_id`, `role_name`, `role_key`, `role_sort`, `status`, `remark`) VALUES
(1, '超级管理员', 'admin', 1, '0', '拥有所有权限'),
(2, '普通用户', 'user', 2, '0', '普通用户，可上传文件和查看检测结果');

-- ----------------------------
-- 初始化用户角色关联
-- ----------------------------
INSERT INTO `sys_user_role` (`user_id`, `role_id`) VALUES
(1, 1);

SET FOREIGN_KEY_CHECKS = 1;