import pandas as pd


# 读取数据集
data = pd.read_csv("./finance数据集.csv")

print(data.head())

import matplotlib.pyplot as plt
import seaborn as sns

plt.figure(figsize=(12, 8))

numeric_cols = data.select_dtypes(include=["int64", "float64"]).columns

for i, col in enumerate(numeric_cols, 1):
  plt.subplot(3, 4, i)
  sns.boxplot(x=data[col])
  plt.title(col)

plt.tight_layout()
plt.show()

Q1 = data[numeric_cols].quantile(0.25)
Q3 = data[numeric_cols].quantile(0.75)
IQR = Q3 - Q1

data_cleaned = data[~((data[numeric_cols] < (Q1 - 1.5 * IQR)) | (data[numeric_cols] > (Q3 + 1.5 * IQR))).any(axis=1)]

duplicates = data_cleaned.duplicated()
num_duplicates = duplicates.sum()
data_cleaned = data_cleaned[~duplicates]

print(f"删除重复行数{num_duplicates}")

from sklearn.preprocessing import MinMaxScaler
scaler = MinMaxScaler()

data_cleaned[numeric_cols] = scaler.fit_transform(data_cleaned[numeric_cols])

target_variable = "SeriousDlqin2yrs"

from sklearn.model_selection import train_test_split

X = data_cleaned.drop(columns=[target_variable])
y = data_cleaned[target_variable]

X_train, x_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

print(f"训练数据形状{X_train.shape}")
print(f"测试数据形状{y_train.shape}")

data_cleaned.to_csv("./output1.csv", index=False)


# 数据清洗规范
1. 数据加载: read_csv()
2. 数据预览: head() 了解数据基本结构和内容
3. 异常值处理: 使用箱线图对每个树枝进行可视化，识别潜在的异常值。使用IQR四分卫距检测并移除异常值；计算每个树枝变量的第一个四分卫Q1和第三个四分卫Q3；计算四分卫距IQR=Q3 - Q1；异常值定义为低于Q1 - 1.5*IQR或高于Q3 - 1.5*IQR的值
4. 重复值处理：检查并移除数据集中的重复纸，以确保唯一性和完整性。记录删除的重复行数
#//5. 数据标准化
# 数据清晰
1. 数据归一化：使用MinMaxScaler对变量进行归一化处理，将数据缩放道0～1之间，以确保所有特征再想死范围内
2. 特征与目标划分：分离特征X雨目标Y
4. 数据标注和划分：train_test_split将数据分为训练集和测试机常用划分比例为8：2
5. 数据保存：使用to_csv保存清洗和处理后的数据