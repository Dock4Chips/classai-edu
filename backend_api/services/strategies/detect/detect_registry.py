from enums.detect_type import TaskType
from services.strategies.detect.image_detect import image_detect
from services.strategies.detect.video_detect import video_detect
from services.strategies.detect.stream_detect import stream_detect
from services.strategies.detect.batch_detect import batch_detect

DETECT_STRATEGY_MAP = {
    TaskType.IMAGE: image_detect,
    TaskType.VIDEO: video_detect,
    TaskType.STREAM: stream_detect,
    TaskType.BATCH: batch_detect,
}