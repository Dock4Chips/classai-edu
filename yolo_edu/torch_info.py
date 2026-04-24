import sys
import platform
import torch

is_mps_available = torch.backends.mps.is_available()
is_mps_built = torch.backends.mps.is_built()
is_cuda_available = torch.cuda.is_available()
cuda_version = torch.version.cuda
cudnn_version = torch.backends.cudnn.version()

print("=== Runtime ===")
print(f"Platform: {platform.platform()}")
print(f"Machine: {platform.machine()}  （Mac Apple Silicon 预期: arm64）")
print(f"Python executable: {sys.executable}")
print(f"Python version: {sys.version.split()[0]}")
print(f"PyTorch version: {torch.__version__}")
print()

print("=== 设备后端状态 ===")
print(f"MPS built: {is_mps_built}      （是否编译了 MPS 支持，Mac 预期: True）")
print(f"MPS available: {is_mps_available}  （当前是否可用 MPS，Mac 预期: True）")
print(f"CUDA available: {is_cuda_available} （是否可用 NVIDIA CUDA，Mac 预期: False）")
print(f"Torch CUDA version: {cuda_version} （Mac 预期: None）")
print(f"Torch cuDNN version: {cudnn_version} （Mac 预期: None）")
print()

if is_mps_available and (not is_cuda_available):
    print("状态: PASS（通过）")
    print("你的 Mac 当前可以使用 MPS（Apple GPU）训练。")
    print(f"推荐训练参数 device: {torch.device('mps')}")
else:
    print("状态: CHECK（需检查）")
    print("当前 MPS 状态不理想，可能会回退到 CPU 训练。")
    print("如果是 Apple Silicon，建议满足：")
    print("  - MPS built = True")
    print("  - MPS available = True")
    print("  - CUDA available = False")
