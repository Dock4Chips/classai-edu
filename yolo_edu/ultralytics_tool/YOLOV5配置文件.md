### YOLOV5的内容已停止更新
### YOLOV5 (本项目下的YOLOV5不是官方YOLOV5的结构，头部使用的是AnchorFree+DFL+TAL，也就是YOLOV8的Head和Loss) [官方预训练权重github链接](https://github.com/ultralytics/assets/releases)
#### YOLOV5的使用方式跟YOLOV8一样,就是选择配置文件选择v5的即可.
1. ultralytics/cfg/models/v5/yolov5-fasternet.yaml

    fasternet替换yolov5主干.

2. ultralytics/cfg/models/v5/yolov5-timm.yaml

    使用timm支持的主干网络替换yolov5主干.timm的内容可看[这期视频](https://www.bilibili.com/video/BV1Mx4y1A7jy/)

3. ultralytics/cfg/models/v5/yolov5-dyhead.yaml

    添加基于注意力机制的目标检测头到yolov5中.

4. 增加Adaptive Training Sample Selection匹配策略.

    在ultralytics/utils/loss.py中的class v8DetectionLoss中自行选择对应的self.assigner即可.  
    此ATSS匹配策略目前占用显存比较大,因此使用的时候需要设置更小的batch,后续会进行优化这一功能.

5. Asymptotic Feature Pyramid Network[reference](https://github.com/gyyang23/AFPN/tree/master)

    a. ultralytics/cfg/models/v5/yolov5-AFPN-P345.yaml  
    b. ultralytics/cfg/models/v5/yolov5-AFPN-P345-Custom.yaml  
    c. ultralytics/cfg/models/v5/yolov5-AFPN-P2345.yaml  
    d. ultralytics/cfg/models/v5/yolov5-AFPN-P2345-Custom.yaml  
    其中Custom中的block具体支持[链接](#b) [B站介绍说明](https://www.bilibili.com/video/BV1bh411A7yj/)

6. ultralytics/cfg/models/v5/yolov5-bifpn.yaml

    添加BIFPN到yolov5中.  
    其中BIFPN中有三个可选参数：
    1. Fusion  
        其中BIFPN中的Fusion模块支持四种: weight, adaptive, concat, bifpn(default), SDI  
        其中weight, adaptive, concat出自[paper链接-Figure 3](https://openreview.net/pdf?id=q2ZaVU6bEsT), SDI出自[U-NetV2](https://github.com/yaoppeng/U-Net_v2)
    2. node_mode  
        其中目前(后续会更新喔)支持这些[结构](#b)
    3. head_channel  
        BIFPN中的通道数,默认设置为256.

7. ultralytics/cfg/models/v5/yolov5-C3-CloAtt.yaml

    使用C3-CloAtt替换C3.(使用CloFormer中的具有全局和局部特征的注意力机制添加到C3中的Bottleneck中)(需要看[常见错误和解决方案的第五点](#a))  

8. ultralytics/cfg/models/v5/yolov5-RevCol.yaml

    使用(ICLR2023)Reversible Column Networks对yolov5主干进行重设计.

9. ultralytics/cfg/models/v5/yolov5-LSKNet.yaml

    LSKNet(2023旋转目标检测SOTA的主干)替换yolov5主干.

10. ultralytics/cfg/models/v5/yolov5-C3-SCConv.yaml

    SCConv(CVPR2020 http://mftp.mmcheng.net/Papers/20cvprSCNet.pdf)与C3融合.

11. ultralytics/cfg/models/v5/yolov5-C3-SCcConv.yaml

    ScConv(CVPR2023 https://openaccess.thecvf.com/content/CVPR2023/papers/Li_SCConv_Spatial_and_Channel_Reconstruction_Convolution_for_Feature_Redundancy_CVPR_2023_paper.pdf)与C3融合.  
    (取名为SCcConv的原因是在windows下命名是不区分大小写的)

12. MPDiou.[论文链接](https://arxiv.org/pdf/2307.07662v1.pdf)

    在ultralytics/utils/loss.py中的BboxLoss class中的forward函数里面进行更换对应的iou计算方式.

13. ultralytics/cfg/models/v5/yolov5-LAWDS.yaml

    Light Adaptive-weight downsampling.自研模块,具体讲解请看百度云链接中的视频.

14. ultralytics/cfg/models/v5/yolov5-C3-EMSC.yaml

    Efficient Multi-Scale Conv.自研模块,具体讲解请看百度云链接中的视频.

15. ultralytics/cfg/models/v5/yolov5-C3-EMSCP.yaml

    Efficient Multi-Scale Conv Plus.自研模块,具体讲解请看百度云链接中的视频.

16. ultralytics/cfg/models/v5/yolov5-RCSOSA.yaml

    使用[RCS-YOLO](https://github.com/mkang315/RCS-YOLO/tree/main)中的RCSOSA替换C3.

17. ultralytics/cfg/models/v5/yolov5-KernelWarehouse.yaml
    
    使用[Towards Parameter-Efficient Dynamic Convolution](https://github.com/OSVAI/KernelWarehouse)添加到yolov5中.  
    使用此模块需要注意,在epoch0-20的时候精度会非常低,过了20epoch会正常.

18. Normalized Gaussian Wasserstein Distance.[论文链接](https://arxiv.org/abs/2110.13389)

    在Loss中使用:
        在ultralytics/utils/loss.py中的BboxLoss class中的__init__函数里面设置self.nwd_loss为True.  
        比例系数调整self.iou_ratio, self.iou_ratio代表iou的占比,(1-self.iou_ratio)为代表nwd的占比.  
    在TAL标签分配中使用:
        在ultralytics/utils/tal.py中的def iou_calculation函数中进行更换即可.  
    以上这两可以配合使用,也可以单独使用.  

19. SlideLoss and EMASlideLoss.[Yolo-Face V2](https://github.com/Krasjet-Yu/YOLO-FaceV2/blob/master/utils/loss.py)

    在ultralytics/utils/loss.py中的class v8DetectionLoss进行设定.  

20. ultralytics/cfg/models/v5/yolov5-C3-DySnakeConv.yaml

    [DySnakeConv](https://github.com/YaoleiQi/DSCNet)与C3融合.  

21. ultralytics/cfg/models/v5/yolov5-EfficientHead.yaml

    对检测头进行重设计,支持10种轻量化检测头.详细请看ultralytics/nn/extra_modules/head.py中的Detect_Efficient class.  

22. ultralytics/cfg/models/v5/yolov5-aux.yaml

    参考YOLOV7-Aux对YOLOV5添加额外辅助训练头,在训练阶段参与训练,在最终推理阶段去掉.  
    其中辅助训练头的损失权重系数可在ultralytics/utils/loss.py中的class v8DetectionLoss中的__init__函数中的self.aux_loss_ratio设定,默认值参考yolov7为0.25.  

23. ultralytics/cfg/models/v5/yolov5-C3-DCNV2.yaml

    使用C3-DCNV2替换C3.(DCNV2为可变形卷积V2)  

24. ultralytics/cfg/models/v5/yolov5-C3-DCNV3.yaml

    使用C3-DCNV3替换C3.([DCNV3](https://github.com/OpenGVLab/InternImage)为可变形卷积V3(CVPR2023,众多排行榜的SOTA))    
    官方中包含了一些指定版本的DCNV3 whl包,下载后直接pip install xxx即可.具体和安装DCNV3可看百度云链接中的视频.  

25. ultralytics/cfg/models/v5/yolov5-C3-Faster.yaml

    使用C3-Faster替换C3.(使用FasterNet中的FasterBlock替换C3中的Bottleneck)  

26. ultralytics/cfg/models/v5/yolov5-C3-ODConv.yaml

    使用C3-ODConv替换C3.(使用ODConv替换C3中的Bottleneck中的Conv)

27. ultralytics/cfg/models/v5/yolov5-C3-Faster-EMA.yaml

    使用C3-Faster-EMA替换C3.(C3-Faster-EMA推荐可以放在主干上,Neck和head部分可以选择C3-Faster)

28. ultralytics/cfg/models/v5/yolov5-dyhead-DCNV3.yaml

    使用[DCNV3](https://github.com/OpenGVLab/InternImage)替换DyHead中的DCNV2.

29. ultralytics/cfg/models/v5/yolov5-FocalModulation.yaml

    使用[Focal Modulation](https://github.com/microsoft/FocalNet)替换SPPF.

30. ultralytics/cfg/models/v5/yolov5-C3-DBB.yaml

    使用C3-DBB替换C3.(使用DiverseBranchBlock替换C3中的Bottleneck中的Conv)

31. ultralytics/cfg/models/v5/yolov5-C3-OREPA.yaml

    使用C3-OREPA替换C2f.[Online Convolutional Re-parameterization (CVPR2022)](https://github.com/JUGGHM/OREPA_CVPR2022/tree/main)

32. ultralytics/cfg/models/v5/yolov5-C3-REPVGGOREPA.yaml

    使用C3-REPVGGOREPA替换C3.[Online Convolutional Re-parameterization (CVPR2022)](https://github.com/JUGGHM/OREPA_CVPR2022/tree/main)

33. ultralytics/cfg/models/v5/yolov5-swintransformer.yaml

    SwinTransformer-Tiny替换yolov5主干.

34. ultralytics/cfg/models/v5/yolov5-repvit.yaml

    [CVPR2024 RepViT](https://github.com/THU-MIG/RepViT/tree/main)替换yolov5主干.

35. ultralytics/cfg/models/v5/yolov5-fasternet-bifpn.yaml

    fasternet与bifpn的结合.  
    其中BIFPN中有三个可选参数：
    1. Fusion  
        其中BIFPN中的Fusion模块支持四种: weight, adaptive, concat, bifpn(default), SDI  
        其中weight, adaptive, concat出自[paper链接-Figure 3](https://openreview.net/pdf?id=q2ZaVU6bEsT), SDI出自[U-NetV2](https://github.com/yaoppeng/U-Net_v2)
    2. node_mode  
        其中目前(后续会更新喔)支持这些[结构](#b)
    3. head_channel  
        BIFPN中的通道数,默认设置为256.

36. ultralytics/cfg/models/v5/yolov5-C3-DCNV2-Dynamic.yaml

    利用自研注意力机制MPCA强化DCNV2中的offset和mask.

37. ultralytics/cfg/models/v5/yolov5-goldyolo.yaml

    利用华为2023最新GOLD-YOLO中的Gatherand-Distribute进行改进特征融合模块

38. ultralytics/cfg/models/v5/yolov5-C3-ContextGuided.yaml

    使用[CGNet](https://github.com/wutianyiRosun/CGNet/tree/master)中的Light-weight Context Guided改进C3.

39. ultralytics/cfg/models/v5/yolov5-ContextGuidedDown.yaml

    使用[CGNet](https://github.com/wutianyiRosun/CGNet/tree/master)中的Light-weight Context Guided DownSample进行下采样.

40. ultralytics/cfg/models/v5/yolov5-C3-MSBlock.yaml

    使用[YOLO-MS](https://github.com/FishAndWasabi/YOLO-MS/tree/main)中的MSBlock改进C3.

41. ultralytics/cfg/models/v5/yolov5-C3-DLKA.yaml

    使用[deformableLKA](https://github.com/xmindflow/deformableLKA)改进C3.

42. ultralytics/cfg/models/v5/yolov5-GFPN.yaml

    使用[DAMO-YOLO](https://github.com/tinyvision/DAMO-YOLO)中的RepGFPN改进Neck.

43. ultralytics/cfg/models/v5/yolov5-SPDConv.yaml

    使用[SPDConv](https://github.com/LabSAINT/SPD-Conv/tree/main)进行下采样.

44. ultralytics/cfg/models/v5/yolov5-EfficientRepBiPAN.yaml

    使用[YOLOV6](https://github.com/meituan/YOLOv6/tree/main)中的EfficientRepBiPAN改进Neck.

45. ultralytics/cfg/models/v5/yolov5-C3-EMBC.yaml

    使用[Efficientnet](https://blog.csdn.net/weixin_43334693/article/details/131114618?spm=1001.2014.3001.5501)中的MBConv与EffectiveSE改进C3.

46. ultralytics/cfg/models/v5/yolov5-SPPF-LSKA.yaml

    使用[LSKA](https://github.com/StevenLauHKHK/Large-Separable-Kernel-Attention)注意力机制改进SPPF,增强多尺度特征提取能力.

47. ultralytics/cfg/models/v5/yolov5-C3-DAttention.yaml

    使用[Vision Transformer with Deformable Attention(CVPR2022)](https://github.com/LeapLabTHU/DAT)改进C2f.(需要看[常见错误和解决方案的第五点](#a))  
    使用注意点请看百度云视频.使用注意点请看百度云视频.(DAttention(Vision Transformer with Deformable Attention CVPR2022)使用注意说明.)

48. ultralytics/cfg/models/v5/yolov5-CSwinTransformer.yaml

    使用[CSWin-Transformer(CVPR2022)](https://github.com/microsoft/CSWin-Transformer/tree/main)替换yolov5主干.(需要看[常见错误和解决方案的第五点](#a))

49. ultralytics/cfg/models/v5/yolov5-AIFI.yaml

    使用[RT-DETR](https://arxiv.org/pdf/2304.08069.pdf)中的Attention-based Intrascale Feature Interaction(AIFI)改进yolov5.

50. ultralytics/cfg/models/v5/yolov5-C3-Parc.yaml

    使用[ParC-Net](https://github.com/hkzhang-git/ParC-Net/tree/main)中的ParC_Operator改进C3.(需要看[常见错误和解决方案的第五点](#a))  
    使用注意点请看百度云视频.(20231031更新说明)  

51. ultralytics/cfg/models/v5/yolov5-C3-DWR.yaml

    使用[DWRSeg](https://arxiv.org/abs/2212.01173)中的Dilation-wise Residual(DWR)模块,加强从网络高层的可扩展感受野中提取特征.

52. ultralytics/cfg/models/v5/yolov5-C3-RFAConv.yaml

    使用[RFAConv](https://github.com/Liuchen1997/RFAConv/tree/main)中的RFAConv改进yolov5.

53. ultralytics/cfg/models/v5/yolov5-C3-RFCBAMConv.yaml

    使用[RFAConv](https://github.com/Liuchen1997/RFAConv/tree/main)中的RFCBAMConv改进yolov5.

54. ultralytics/cfg/models/v8/yolov5-C3-RFCAConv.yaml

    使用[RFAConv](https://github.com/Liuchen1997/RFAConv/tree/main)中的RFCAConv改进yolov5.

55. ultralytics/cfg/models/v5/yolov5-HGNetV2.yaml

    使用HGNetV2作为YOLOV5的backbone.

56. ultralytics/cfg/models/v5/yolov5-GhostHGNetV2.yaml

    使用Ghost_HGNetV2作为YOLOV5的backbone.

57. ultralytics/cfg/models/v5/yolov5-RepHGNetV2.yaml

    使用Rep_HGNetV2作为YOLOV5的backbone.

58. ultralytics/cfg/models/v5/yolov5-C3-FocusedLinearAttention.yaml

    使用[FLatten Transformer(ICCV2023)](https://github.com/LeapLabTHU/FLatten-Transformer)中的FocusedLinearAttention改进C3.(需要看[常见错误和解决方案的第五点](#a)) 
    使用注意点请看百度云视频.(20231114版本更新说明.)

59. IoU,GIoU,DIoU,CIoU,EIoU,SIoU更换方法.

    请看百度云视频.(20231114版本更新说明.)

60. Inner-IoU,Inner-GIoU,Inner-DIoU,Inner-CIoU,Inner-EIoU,Inner-SIoU更换方法.

    请看百度云视频.(20231114版本更新说明.)

61. Inner-MPDIoU更换方法.

    请看百度云视频.(20231114版本更新说明.)

62. ultralytics/cfg/models/v5/yolov5-C3-MLCA.yaml

    使用[Mixed Local Channel Attention 2023](https://github.com/wandahangFY/MLCA/tree/master)改进C3.(用法请看百度云视频-20231129版本更新说明)

63. ultralytics/cfg/models/v5/yolov5-C3-AKConv.yaml

    使用[AKConv 2023](https://github.com/CV-ZhangXin/AKConv)改进C3.(用法请看百度云视频-20231129版本更新说明)

64. ultralytics/cfg/models/v5/yolov5-unireplknet.yaml

    使用[UniRepLKNet](https://github.com/AILab-CVC/UniRepLKNet/tree/main)替换yolov5主干.

65. ultralytics/cfg/models/v5/yolov5-C3-UniRepLKNetBlock.yaml

    使用[UniRepLKNet](https://github.com/AILab-CVC/UniRepLKNet/tree/main)中的UniRepLKNetBlock改进C3.

66. ultralytics/cfg/models/v5/yolov5-C3-DRB.yaml

    使用[UniRepLKNet](https://github.com/AILab-CVC/UniRepLKNet/tree/main)中的DilatedReparamBlock改进C3.

67. ultralytics/cfg/models/v5/yolov5-C3-DWR-DRB.yaml

    使用[UniRepLKNet](https://github.com/AILab-CVC/UniRepLKNet/tree/main)中的DilatedReparamBlock对[DWRSeg](https://arxiv.org/abs/2212.01173)中的Dilation-wise Residual(DWR)的模块进行二次创新后改进C3.

68. ultralytics/cfg/models/v5/yolov5-ASF.yaml

    使用使用[ASF-YOLO](https://github.com/mkang315/ASF-YOLO)中的Attentional Scale Sequence Fusion改进yolov5.

69. ultralytics/cfg/models/v5/yolov5-ASF-P2.yaml

    在ultralytics/cfg/models/v8/yolov8-ASF.yaml的基础上进行二次创新，引入P2检测层并对网络结构进行优化.

70. ultralytics/cfg/models/v5/yolov5-CSP-EDLAN.yaml

    使用[DualConv](https://github.com/ChipsGuardian/DualConv)打造CSP Efficient Dual Layer Aggregation Networks改进yolov5.

71. ultralytics/cfg/models/v5/yolov5-TransNeXt.yaml

    使用[TransNeXt](https://github.com/DaiShiResearch/TransNeXt)改进yolov5的backbone.(需要看[常见错误和解决方案的第五点](#a))   

72. ultralytics/cfg/models/v5/yolov5-AggregatedAttention.yaml

    使用[TransNeXt](https://github.com/DaiShiResearch/TransNeXt)中的聚合感知注意力改进yolov5的backbone.(需要看[常见错误和解决方案的第五点](#a))   

73. ultralytics/cfg/models/v5/yolov5-C3-AggregatedAtt.yaml

    使用[TransNeXt](https://github.com/DaiShiResearch/TransNeXt)中的聚合感知注意力改进C3.(需要看[常见错误和解决方案的第五点](#a))   

74. ultralytics/cfg/models/v5/yolov5-bifpn-SDI.yaml

    使用[U-NetV2](https://github.com/yaoppeng/U-Net_v2)中的 Semantics and Detail Infusion Module对BIFPN进行二次创新.

75. ultralytics/cfg/models/v5/yolov5-SDI.yaml

    使用[U-NetV2](https://github.com/yaoppeng/U-Net_v2)中的 Semantics and Detail Infusion Module对yolov5中的feature fusion部分进行重设计.

76. Shape-IoU,Inner-Shape-IoU更换方法.

    请看百度云视频.(20240104版本更新说明.)

77. FocalLoss,VarifocalLoss,QualityfocalLoss更换方法.

    请看百度云视频.(20240111版本更新说明.)

78. Wise-IoU(v1,v2,v3)系列(IoU,WIoU,EIoU,GIoU,DIoU,CIoU,SIoU,MPDIoU,ShapeIoU)更换方法.

    请看百度云视频.(20240111版本更新说明.)

79. Inner-Wise-IoU(v1,v2,v3)系列(IoU,WIoU,EIoU,GIoU,DIoU,CIoU,SIoU,MPDIoU,ShapeIoU)更换方法.

    请看百度云视频.(20240111版本更新说明.)

80. ultralytics/cfg/models/v8/yolov8-goldyolo-asf.yaml

    利用华为2023最新GOLD-YOLO中的Gatherand-Distribute与[ASF-YOLO](https://github.com/mkang315/ASF-YOLO)中的Attentional Scale Sequence Fusion进行二次创新改进yolov8的neck.

81. ultralytics/cfg/models/v5/yolov5-C2-DCNV4.yaml

    使用[DCNV4](https://github.com/OpenGVLab/DCNv4)改进C3.(请关闭AMP进行训练,使用教程请看20240116版本更新说明)

82. ultralytics/cfg/models/v5/yolov5-dyhead-DCNV4.yaml

    使用[DCNV4](https://github.com/OpenGVLab/DCNv4)对DyHead进行二次创新.(请关闭AMP进行训练,使用教程请看20240116版本更新说明)

83. ultralytics/cfg/models/v5/yolov5-HSFPN.yaml

    使用[MFDS-DETR](https://github.com/JustlfC03/MFDS-DETR)中的HS-FPN改进yolov5的neck.

84. ultralytics/cfg/models/v5/yolov5-HSPAN.yaml

    对[MFDS-DETR](https://github.com/JustlfC03/MFDS-DETR)中的HS-FPN进行二次创新后得到HSPAN改进yolov5的neck.

85. soft-nms(IoU,GIoU,DIoU,CIoU,EIoU,SIoU,ShapeIoU)

    soft-nms替换nms.(建议:仅在val.py时候使用,具体替换请看20240122版本更新说明)

86. ultralytics/cfg/models/v5/yolov5-dysample.yaml

    使用[ICCV2023 DySample](https://arxiv.org/abs/2308.15085)改进yolov5-neck中的上采样.

87. ultralytics/cfg/models/v5/yolov5-CARAFE.yaml

    使用[ICCV2019 CARAFE](https://arxiv.org/abs/1905.02188)改进yolov5-neck中的上采样.

88. ultralytics/cfg/models/v5/yolov5-HWD.yaml

    使用[Haar wavelet downsampling](https://www.sciencedirect.com/science/article/abs/pii/S0031320323005174)改进yolov5的下采样.(请关闭AMP情况下使用)

89. Focaler-IoU系列(IoU,GIoU,DIoU,CIoU,EIoU,SIoU,WIoU,MPDIoU,ShapeIoU)

    请看百度云视频.(20240203更新说明)

90. ultralytics/cfg/models/v5/yolov5-GDFPN.yaml

    使用[DAMO-YOLO](https://github.com/tinyvision/DAMO-YOLO)中的RepGFPN与[ICCV2023 DySample](https://arxiv.org/abs/2308.15085)进行二次创新改进Neck.

91. ultralytics/cfg/models/v5/yolov5-HSPAN-DySample.yaml

    对[MFDS-DETR](https://github.com/JustlfC03/MFDS-DETR)中的HS-FPN进行二次创新后得到HSPAN再进行创新,使用[ICCV2023 DySample](https://arxiv.org/abs/2308.15085)改进其上采样模块.

92. ultralytics/cfg/models/v5/yolov5-ASF-DySample.yaml

    使用[ASF-YOLO](https://github.com/mkang315/ASF-YOLO)中的Attentional Scale Sequence Fusion与[ICCV2023 DySample](https://arxiv.org/abs/2308.15085)组合得到Dynamic Sample Attentional Scale Sequence Fusion.

93. ultralytics/cfg/models/v5/yolov5-SEAMHead.yaml

    使用[YOLO-Face V2](https://arxiv.org/pdf/2208.02019v2.pdf)中的遮挡感知注意力改进Head,使其有效地处理遮挡场景.

94. ultralytics/cfg/models/v5/yolov5-MultiSEAMHead.yaml

    使用[YOLO-Face V2](https://arxiv.org/pdf/2208.02019v2.pdf)中的遮挡感知注意力改进Head,使其有效地处理遮挡场景.

95. ultralytics/cfg/models/v5/yolov5-C3-SWC.yaml

    使用[shift-wise conv](https://arxiv.org/abs/2401.12736)改进yolov5中的C3.

96. ultralytics/cfg/models/v5/yolov5-C3-iRMB.yaml

    使用[EMO ICCV2023](https://github.com/zhangzjn/EMO)中的iRMB改进C3.

97. ultralytics/cfg/models/v5/yolov5-C3-iRMB-Cascaded.yaml

    使用[EfficientViT CVPR2023](https://github.com/microsoft/Cream/tree/main/EfficientViT)中的CascadedGroupAttention对[EMO ICCV2023](https://github.com/zhangzjn/EMO)中的iRMB进行二次创新来改进C3.

98. ultralytics/cfg/models/v5/yolov5-C3-iRMB-DRB.yaml

    使用[UniRepLKNet](https://github.com/AILab-CVC/UniRepLKNet/tree/main)中的DilatedReparamBlock对[EMO ICCV2023](https://github.com/zhangzjn/EMO)中的iRMB进行二次创新来改进C3.

99. ultralytics/cfg/models/v5/yolov5-C3-iRMB-SWC.yaml

    使用[shift-wise conv](https://arxiv.org/abs/2401.12736)对[EMO ICCV2023](https://github.com/zhangzjn/EMO)中的iRMB进行二次创新来改进C3.

100. ultralytics/cfg/models/v5/yolov5-C3-VSS.yaml

    使用最新的Mamba架构[Mamba-UNet中的VSS](https://github.com/ziyangwang007/Mamba-UNet)对C2f中的BottleNeck进行改进,使其能更有效地捕获图像中的复杂细节和更广泛的语义上下文.

101. ultralytics/cfg/models/v5/yolov5-C3-LVMB.yaml

    使用最新的Mamba架构[Mamba-UNet中的VSS](https://github.com/ziyangwang007/Mamba-UNet)与Cross Stage Partial进行结合,使其能更有效地捕获图像中的复杂细节和更广泛的语义上下文.

102. ultralytics/cfg/models/v5/yolov5-RepNCSPELAN.yaml

    使用[YOLOV9](https://github.com/WongKinYiu/yolov9)中的RepNCSPELAN进行改进yolov5.

# 常见错误和解决方案(如果是跑自带的一些配置文件报错可以先看看第十大点对应的配置文件是否有提示需要修改内容)
1. RuntimeError: xxxxxxxxxxx does not have a deterministic implementation, but you set 'torch.use_deterministic_algorithms(True)'.....

    解决方案：在ultralytics/utils/torch_utils.py中init_seeds函数中把torch.use_deterministic_algorithms里面的True改为False

2. ModuleNotFoundError：No module named xxx

    解决方案：缺少对应的包，先把YOLOV8环境配置的安装命令进行安装一下，如果还是缺少显示缺少包，安装对应的包即可(xxx就是对应的包).

3. OMP: Error #15: Initializing libiomp5md.dll, but found libiomp5md.dll already initialized.  

    解决方案：https://zhuanlan.zhihu.com/p/599835290

4. 训练过程中loss出现nan.

    可以尝试关闭AMP混合精度训练.(train.py中加amp=False)

<a id="a"></a>

5. 固定640x640尺寸的解决方案.

    运行train.py中的时候需要在ultralytics/models/yolo/detect/train.py的DetectionTrainer class中的build_dataset函数中的rect=mode == 'val'改为rect=False.其他模型可以修改回去.  
    运行val.py的时候,把val.py的rect=False注释取消即可.其他模型可以修改回去.  
    运行detect.py中的时候需要在ultralytics/engine/predictor.py找到函数def pre_transform(self, im),在LetterBox中的auto改为False,其他模型可以修改回去.  

6. 多卡训练问题.[参考链接](https://docs.ultralytics.com/yolov5/tutorials/multi_gpu_training/#multi-gpu-dataparallel-mode-not-recommended:~:text=just%201%20GPU.-,Multi%2DGPU%20DistributedDataParallel%20Mode%20(%E2%9C%85%20recommended),-You%20will%20have)

    python -m torch.distributed.run --nproc_per_node 2 train.py

7. 指定显卡训练.

    1. 使用device参数进行指定.  
    2. 参考链接:https://blog.csdn.net/m0_55097528/article/details/130323125, 简单来说就是用这个来代替device参数.  

8. ValueError: Expected more than 1 value per channel when training, got input size torch.Size...

    如果是在训练情况下的验证阶段出现的话,大概率就是最后一个验证的batch为1,这种情况只需要把验证集多一张或者少一张即可,或者变更batch参数.

9. AttributeError: Can't pickle local object 'EMASlideLoss.__init__.<locals>.<lambda>'

    可以在ultralytics/utils/loss.py中添加import dill as pickle,然后装一下dill这个包.  
    pip install dill -i https://pypi.tuna.tsinghua.edu.cn/simple

10. RuntimeError: Dataset 'xxxxx' error ❌

    将data.yaml中的路径都改为绝对路径.

11. WARNING  NMS time limit 2.100s exceeded

    在ultralytics/utils/ops.py中non_max_suppression函数里面找到这个语句：
        time_limit = 2.0 + max_time_img * bs  # seconds to quit after
    前面的2.0自己改大点即可，大到不会出现这个NMS time limit即可.

12. OSError: [WinError 1455] 页面文件太小，无法完成操作。

    此问题常见于windows训练.一般情况下有两种解决方案:
    1. 把workers设置小点直接不会报错.最小为0
    2. 扩大虚拟内存(可百度).