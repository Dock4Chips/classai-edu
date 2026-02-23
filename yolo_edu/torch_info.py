import sys
import torch

print(torch.backends.mps.is_available())
print(torch.backends.mps.is_built())

print(f"PyTorch version: {torch.__version__}")
print(f"Python version: {sys.version}")
print(f"Torch CUDA version: {torch.version.cuda}")
print(f"Torch cuDNN version: {torch.backends.cudnn.version()}")
print(f"CUDA available: {torch.cuda.is_available()}")


print(torch.device("mps") if torch.backends.mps.is_available() else "no mps")
