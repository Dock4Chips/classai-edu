import cv2
from yolo_edu.services.model_config_service import ModelConfigService


class DrawTool:

    @classmethod
    def get_color(cls, class_name: str):
        return ModelConfigService.get_color(class_name)

    @classmethod
    def draw_bbox(cls, image, bbox, label, conf=None, color=None):
        if color is None:
            color = cls.get_color(label)

        x1, y1, x2, y2 = map(int, bbox)
        h, w = image.shape[:2]
        lw = max(round((h + w) / 2 * 0.003), 2)
        font = cv2.FONT_HERSHEY_SIMPLEX
        font_scale = lw / 3
        thickness = max(lw - 1, 1)
        pad = 3
        txt_color = (255, 255, 255)
        cv2.rectangle(image, (x1, y1), (x2, y2), color, lw, lineType=cv2.LINE_AA)
        text = label
        if conf is not None:
            text += f" {conf:.2f}"
        cv2.putText(
            image,
            text,
            (x1 + pad, y1 - pad),
            font,
            font_scale,
            txt_color,
            thickness,
            lineType=cv2.LINE_AA
        )
        return image

    # @classmethod
    # def draw_crosshair(cls, image, center, size=20, color=(0, 255, 0)):
    #     """
    #     在图像上绘制十字准星
    #
    #     Args:
    #         image: 输入图像
    #         center: 中心点坐标 (x, y)
    #         size: 十字大小
    #         color: 颜色
    #
    #     Returns:
    #         绘制后的图像
    #     """
    #     x, y = map(int, center)
    #
    #     # 绘制水平线
    #     cv2.line(image, (x - size, y), (x + size, y), color, 2)
    #
    #     # 绘制垂直线
    #     cv2.line(image, (x, y - size), (x, y + size), color, 2)
    #
    #     return image
    #
    # @classmethod
    # def draw_timeline(cls, behaviors, output_path, width=1200, height=300):
    #     """
    #     绘制行为时间轴
    #
    #     Args:
    #         behaviors: 行为列表 [{'frame': n, 'behavior': 'sleeping', ...}, ...]
    #         output_path: 输出路径
    #         width: 图像宽度
    #         height: 图像高度
    #
    #     Returns:
    #         输出路径
    #     """
    #
    #
    #     # 创建图像
    #     fig, ax = plt.subplots(figsize=(width / 100, height / 100))
    #
    #     # 收集所有行为
    #     all_behaviors = set()
    #     for item in behaviors:
    #         all_behaviors.add(item['behavior'])
    #
    #     # 为每个行为分配一个 y 坐标
    #     behavior_y = {behavior: i for i, behavior in enumerate(sorted(all_behaviors))}
    #
    #     # 绘制行为片段
    #     for i in range(len(behaviors) - 1):
    #         current = behaviors[i]
    #         next_item = behaviors[i + 1]
    #
    #         start_frame = current['frame']
    #         end_frame = next_item['frame']
    #         behavior = current['behavior']
    #
    #         # 绘制矩形
    #         color = cls._get_matplotlib_color(behavior)
    #         rect = mpatches.Rectangle(
    #             (start_frame, behavior_y[behavior] - 0.4),
    #             end_frame - start_frame,
    #             0.8,
    #             linewidth=1,
    #             edgecolor='black',
    #             facecolor=color,
    #             label=behavior
    #         )
    #         ax.add_patch(rect)
    #
    #     # 设置标签
    #     ax.set_yticks(list(behavior_y.values()))
    #     ax.set_yticklabels(list(behavior_y.keys()))
    #     ax.set_xlabel('Frame')
    #     ax.set_ylabel('Behavior')
    #     ax.set_title('Behavior Timeline')
    #
    #     # 添加图例
    #     handles, labels = ax.get_legend_handles_labels()
    #     by_label = dict(zip(labels, handles))
    #     ax.legend(by_label.values(), by_label.keys(), loc='upper right')
    #
    #     plt.tight_layout()
    #     plt.savefig(output_path, dpi=100, bbox_inches='tight')
    #     plt.close()
    #
    #     return output_path
    #
    # @classmethod
    # def _get_matplotlib_color(cls, behavior):
    #     """获取 matplotlib 使用的颜色"""
    #     color_map = {
    #         'staff': 'blue',
    #         'learning_to_copy': 'green',
    #         'looking_around': 'red',
    #         'using_mobile': 'cyan',
    #         'sharing_answers': 'magenta',
    #         'sleeping': 'yellow'
    #     }
    #     return color_map.get(behavior, 'gray')
    #
    # @classmethod
    # def create_summary_image(cls, images, rows, cols, output_path):
    #     """
    #     创建图像摘要（将多张图片拼接成网格）
    #
    #     Args:
    #         images: 图片列表
    #         rows: 行数
    #         cols: 列数
    #         output_path: 输出路径
    #
    #     Returns:
    #         输出路径
    #     """
    #     # 检查图片数量
    #     if len(images) > rows * cols:
    #         raise ValueError(f"图片数量 {len(images)} 超过网格容量 {rows * cols}")
    #
    #     # 获取单张图片尺寸
    #     h, w = images[0].shape[:2]
    #
    #     # 创建空白画布
    #     canvas = np.zeros((h * rows, w * cols, 3), dtype=np.uint8)
    #
    #     # 填充图片
    #     for idx, img in enumerate(images):
    #         row = idx // cols
    #         col = idx % cols
    #
    #         y1 = row * h
    #         y2 = y1 + h
    #         x1 = col * w
    #         x2 = x1 + w
    #
    #         canvas[y1:y2, x1:x2] = img
    #
    #     # 保存
    #     cv2.imwrite(output_path, canvas)
    #
    #     return output_path



