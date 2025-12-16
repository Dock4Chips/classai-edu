import os
import shutil
import re

def copy_and_rename(src_dir, dst_dir, new_name):
    '''
    不再修改原文件 将文件复制到新目录
    :param src_dir: 原始文件夹路径
    :param dst_dir: 保存新文件的目标路径
    :param new_name: 新的命名前缀
    :return:
    '''
    os.makedirs(dst_dir, exist_ok=True)

    file_list = sorted(os.listdir(src_dir))

    count = 1
    for filename in file_list:
        old_path = os.path.join(src_dir, filename)

        # 跳过文件夹
        if os.path.isdir(old_path):
            continue

        # 获取拓展名
        ext = os.path.splitext(filename)[1]

        # 新文件命名
        new_filename = f"{new_name}{count:02d}{ext}"
        new_path = os.path.join(dst_dir, new_filename)

        # 复制文件并重命名
        shutil.copy2(old_path, new_path)

        count += 1

    print("复制与重命名完成！")




def update_multi_label_id(txt_dir, id_map):
    """
    基于映射字典更新标签文件
    :param txt_dir: txt 标签所在目录
    :param id_map: 旧ID到新ID的映射，如 {0:1, 1:3, 2:0}
    """
    for filename in os.listdir(txt_dir):
        if filename.endswith(".txt"):
            path = os.path.join(txt_dir, filename)

            with open(path, "r") as file:
                lines = file.readlines()

            new_lines = []
            for line in lines:
                parts = line.strip().split()
                if parts:
                    old_id = int(parts[0])
                    if old_id in id_map:
                        parts[0] = str(id_map[old_id])
                new_lines.append(" ".join(parts) + "\n")

            with open(path, "w") as file:
                file.writelines(new_lines)

    print("全部 ID 映射替换完成！")


def count_files(directory):
    """
    统计指定目录下的文件数量（不包含子目录）
    :param directory: 需要统计的文件夹路径
    :return: 文件数量
    """
    count = 0
    for item in os.listdir(directory):
        if os.path.isfile(os.path.join(directory, item)):
            count += 1
    return count



def convert_labels(txt_dir):
    """
    旧标签体系 -> 新标签体系映射
    不需要的标签行直接丢弃
    """
    id_map = {
        1: 1,  # learning_to_copy
        2: 2,  # looking_around
        4: 5,  # talking
        5: 0,  # using_phone
    }

    removed_count = 0
    changed_count = 0

    for filename in os.listdir(txt_dir):
        if filename.endswith(".txt"):
            path = os.path.join(txt_dir, filename)

            with open(path, "r") as f:
                lines = f.readlines()

            new_lines = []
            for line in lines:
                parts = line.strip().split()
                if not parts:
                    continue

                old_id = int(parts[0])

                if old_id not in id_map:
                    # examiner(0) 和 normal sitting(3) → 丢弃
                    removed_count += 1
                    continue

                # 替换 ID
                parts[0] = str(id_map[old_id])
                new_lines.append(" ".join(parts) + "\n")
                changed_count += 1

            with open(path, "w") as f:
                f.writelines(new_lines)

    print(f"标签转换完成！修改 {changed_count} 行，删除无效标签 {removed_count} 行！")




def copy_and_rename_continue(src_dir, dst_dir, new_name):
    """
    继续沿用目标目录已有编号进行复制命名
    :param src_dir: 新文件目录
    :param dst_dir: 已命名文件目录
    :param new_name: 命名前缀
    """

    os.makedirs(dst_dir, exist_ok=True)

    # 查找目标目录中最大编号
    existing_files = [f for f in os.listdir(dst_dir) if f.startswith(new_name)]
    max_num = 0

    for f in existing_files:
        match = re.search(rf"{re.escape(new_name)}(\d+)", f)
        if match:
            num = int(match.group(1))
            max_num = max(max_num, num)

    # 起始编号设为 max_num + 1
    next_num = max_num + 1

    # 开始复制与重命名
    for filename in sorted(os.listdir(src_dir)):
        old_path = os.path.join(src_dir, filename)

        if os.path.isdir(old_path):
            continue

        ext = os.path.splitext(filename)[1]
        new_filename = f"{new_name}{next_num:02d}{ext}"
        new_path = os.path.join(dst_dir, new_filename)

        shutil.copy2(old_path, new_path)
        next_num += 1

    print(f"复制 & 续编号完成！下一个起始编号为: {next_num - 1}")


if __name__ == '__main__':
    # src_dir = r'/Users/dock4chips/Script-P/datasets/exam cheating detector.v3i.yolov8-obb/train/labels'
    # dst_dir = r'test'
    # new_name = 'data_rbg_frame'
    # copy_and_rename(src_dir,dst_dir,new_name)

    # txt_dir = r'sleep'
    # id_map = {
    #     3: 4,
    # }
    # update_multi_label_id(txt_dir, id_map)

    files = r'/Users/dock4chips/Script-P/datasets/datasets/images'

    # print(42 + 40 + 40 + 41 + 309 + 246)
    print(count_files(files))
    # 42 + 40 + 40 + 41 + 309 + 246

    # txt_dir = r'/Users/dock4chips/Script-P/datasets/Exam cheating 2.v4i.yolov8/test/labels'
    # convert_labels(txt_dir)
    #
    # txt_dir = r'/Users/dock4chips/Script-P/datasets/Exam cheating 2.v4i.yolov8/train/labels'
    # convert_labels(txt_dir)
    #
    # txt_dir = r'/Users/dock4chips/Script-P/datasets/Exam cheating 2.v4i.yolov8/val/labels'
    # convert_labels(txt_dir)

    src_dir = r'test'
    dst_dir = r'datasets/labels'
    new_name = 'data_rbg_frame'
    # copy_and_rename_continue(src_dir, dst_dir, new_name)

# nc: 6
# names: ['examiner', 'learning to copy', 'looking around', 'normal sitting', 'talking', 'using phone']