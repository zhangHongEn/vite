import pandas as pd

data = pd.read_csv("./medical_data.csv", encoding="gbk")

print(data.dtypes)
print(data.info())

print(data.isnull().sum())

data["就诊日期"] = pd.to_datetime(data["就诊日期"])
data["诊断日期"] = pd.to_datetime(data["诊断日期"])
data.rename(columns={"病人ID": "患者ID"}, inplace=True)

print(data.info())

from datetime import datetime

data["诊断延迟"] = (data["诊断日期"] - data["就诊日期"]).dt.days
data["病程"] = (datetime(2024, 9, 1) - data["诊断日期"]).dt.days

data = data[(data["诊断延迟"] >= 0) & (data["年龄"] > 0) & (data["年龄"] < 120)]

print(data.describe())

initial_rows = data.shape[0]
data.drop_duplicates(inplace=True)
deleted_rows = initial_rows - data.shape[0]
print(f"删除重复行数: {deleted_rows}")

from sklearn.preprocessing import MinMaxScaler
scaler = MinMaxScaler()

# 归一化
columns_to_normalize = ["年龄", "体重", "身高"]
data[columns_to_normalize] = scaler.fit_transform(data[columns_to_normalize])

print(data)

import matplotlib.pyplot as plt
import matplotlib.font_manager as fm

tod = data.groupby("疾病类型")["治疗结果"].value_counts().unstack()
print(tod)

font_path = "/System/Library/Fonts/PingFang.ttc"

tod.plot(kind="bar", stacked=True)
plt.title("不同疾病分布")
plt.xlabel("疾病了行")
plt.xlabel("治疗结果")
plt.xticks()
plt.xticks()
plt.legend()
plt.show()

plt.scatter(data["年龄"], data["疾病严重程度"])
plt.title("年龄疾病关系")
plt.xlabel("年龄")
plt.ylabel("疾病严重")
plt.xticks()
plt.yticks()
plt.legend()
plt.show()

data.to_csv("./ouit1.csv")
# 加载处理
1. 使用read_csv()读取数据, 使用data.dtypes查看列数据结构, shiyong .info()查看表详情, 使用isnull().sum()查看缺失值数据
2. 重复纸处理: 使用drop_duplicates删除重复纸, 使用.shape记录删除前后的总数计算删除的条数
3. 使用rename修改列名字患者id
4. 使用pd.to_datetime将xx列改为yyyy-mm-dd日期类型
4. 使用MinMaxScaler 对年龄身高体重进行数据归一化c护理
5.使用groupby分组
6.使用plot话柱状图 使用scatter话三点图
# 清洗规范