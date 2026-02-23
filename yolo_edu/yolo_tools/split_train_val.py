# -*- coding: utf-8 -*-
# ----------------------------------------------------------------------------
# 文件名: {随机划分验证集}.py
# 功能: {为了强化训练效果，我们有时候需要每一次训练都重新划分验证集。本程序可以将train文件夹中的数据按比例划分到val中。包括jpg和对应的txt文件。}
# 作者: Dock4Chips
# 创建日期: 2025年12月9日
# 最后修改日期: 2025年12月9日
# 版本: {V1.0}
# ----------------------------------------------------------------------------

import os
import random
import shutil

# ----------------------
# 用户配置区域（手动修改以下路径）
# ----------------------
# 原始路径（所有数据在 train 中）
SOURCE_IMAGES_DIR = "/Users/dock4chips/Downloads/images"
SOURCE_LABELS_DIR = "/Users/dock4chips/Downloads/labels"

# 目标路径
TRAIN_IMAGES_DIR = "/Users/dock4chips/Downloads/active/train/images"
TRAIN_LABELS_DIR = "/Users/dock4chips/Downloads/active/train/labels"
VAL_IMAGES_DIR = "/Users/dock4chips/Downloads/active/val/images"
VAL_LABELS_DIR = "/Users/dock4chips/Downloads/active/val/labels"
TEST_IMAGES_DIR = "/Users/dock4chips/Downloads/active/test/images"
TEST_LABELS_DIR = "/Users/dock4chips/Downloads/active/test/labels"

# 划分比例
TRAIN_RATIO = 0.7  # 训练集 70%
VAL_RATIO = 0.2    # 验证集 20%
TEST_RATIO = 0.1   # 测试集 10%

# ----------------------

def validate_and_split():
    # 确保目标目录存在
    os.makedirs(TRAIN_IMAGES_DIR, exist_ok=True)
    os.makedirs(TRAIN_LABELS_DIR, exist_ok=True)
    os.makedirs(VAL_IMAGES_DIR, exist_ok=True)
    os.makedirs(VAL_LABELS_DIR, exist_ok=True)
    os.makedirs(TEST_IMAGES_DIR, exist_ok=True)
    os.makedirs(TEST_LABELS_DIR, exist_ok=True)

    # 获取所有有效标签文件（排除没有对应图片的标签）
    valid_pairs = []
    for label_file in os.listdir(SOURCE_LABELS_DIR):
        if label_file.endswith(".txt"):
            # 获取不带扩展名的文件名
            base_name = os.path.splitext(label_file)[0]
            # 对应的图片文件路径
            img_path = os.path.join(SOURCE_IMAGES_DIR, f"{base_name}.jpg")

            # 检查图片是否存在
            if os.path.exists(img_path):
                valid_pairs.append((img_path, os.path.join(SOURCE_LABELS_DIR, label_file)))

    # 计算需要移动的数量
    total_valid = len(valid_pairs)
    train_count = int(total_valid * TRAIN_RATIO)
    val_count = int(total_valid * VAL_RATIO)
    test_count = total_valid - train_count - val_count
    print(f"找到 {total_valid} 个有效图片-标签对")
    print(f"划分方案: 训练集{train_count}, 验证集{val_count}, 测试集{test_count}")

    # 随机打乱
    random.shuffle(valid_pairs)

    # 移动文件到训练集
    moved_train = 0
    for i in range(train_count):
        img_src, label_src = valid_pairs[i]
        try:
            img_dst = os.path.join(TRAIN_IMAGES_DIR, os.path.basename(img_src))
            shutil.move(img_src, img_dst)
            label_dst = os.path.join(TRAIN_LABELS_DIR, os.path.basename(label_src))
            shutil.move(label_src, label_dst)
            moved_train += 1
        except Exception as e:
            print(f"移动 {os.path.basename(img_src)} 失败: {str(e)}")

    # 移动文件到验证集
    moved_val = 0
    for i in range(train_count, train_count + val_count):
        img_src, label_src = valid_pairs[i]
        try:
            img_dst = os.path.join(VAL_IMAGES_DIR, os.path.basename(img_src))
            shutil.move(img_src, img_dst)
            label_dst = os.path.join(VAL_LABELS_DIR, os.path.basename(label_src))
            shutil.move(label_src, label_dst)
            moved_val += 1
        except Exception as e:
            print(f"移动 {os.path.basename(img_src)} 失败: {str(e)}")

    # 移动文件到测试集
    moved_test = 0
    for i in range(train_count + val_count, total_valid):
        img_src, label_src = valid_pairs[i]
        try:
            img_dst = os.path.join(TEST_IMAGES_DIR, os.path.basename(img_src))
            shutil.move(img_src, img_dst)
            label_dst = os.path.join(TEST_LABELS_DIR, os.path.basename(label_src))
            shutil.move(label_src, label_dst)
            moved_test += 1
        except Exception as e:
            print(f"移动 {os.path.basename(img_src)} 失败: {str(e)}")

    print(f"\n操作完成！")
    print(f"训练集: {moved_train}/{train_count} 对文件")
    print(f"验证集: {moved_val}/{val_count} 对文件")
    print(f"测试集: {moved_test}/{test_count} 对文件")


if __name__ == "__main__":
    validate_and_split()