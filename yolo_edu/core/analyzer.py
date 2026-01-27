from typing import List


class Analyzer:
    def __init__(self, alert_behaviors :List[str]):
        self.alert_behaviors = alert_behaviors


    def analyze_behavior_sequence(self, all_detections, fps=30, time_window=5):
        """
        行为序列分析
        """

    def alert_system(self, img_path, alert_behaviors):
        """触发告警"""
        pass

    def attendance_report(self, video_path):
        """统计出勤/专注度"""
        pass

    def behavior_statistics(self, image_list):
        """批量分析行为"""
        pass


if __name__ == '__main__':
    ...