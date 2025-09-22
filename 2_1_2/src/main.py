import pandas as pd


# 读取数据集
data = pd.DataFrame({
  "patientID": [1,2,3,3,4],
  "mpg": [1,2,3,3,4],
  "displacement": [1,2,3,3,4],
  "cylinders": [1,2,None,3,4],
  "weight": [1,2,3,3,4],
  "horsepower": [1,None,"3",3,4]
})

initial_row_count = data.shape[0]
data = data.dropna()
final_row_count = data.shape[0]
print(f"处理后数据行数: {final_row_count}, 删除数据行数: {initial_row_count - final_row_count}")

data = data.drop_duplicates()

from sklearn.preprocessing import StandardScaler
numerical_features = ["4.您的生活费<=1000元 1000TODOTODOTODO"]
scaler = StandardScaler()
data[numerical_features] = scaler.fit_transform(data[numerical_features])

selected_features = ["1.您的性别是", '您的年纪', "3. 您的出生地"]
X = data[selected_features]
y = data['低碳行为积极性']

from sklearn.model_selection import train_test_split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

cleaned_data = pd.concat([X, y], axis=1)
cleaned_data.to_csv("./output1.csv", index=False)

1. 数据加载： 使用read_csv加载数据集
2. 数据预览：使用head（）函数预览数据前5航确认数据结构
3. 缺失值处理：可使用data.isnull().sum()检查缺失值情况, 使用dropna()删除缺失值
4. 检查并删除重复纸 使用data.duplicates()删除重复纸
5. 数据标准化： StandardScaler进行标准化处理，均值为0 标准差为1

数据标注
1. 特征选则： 根据业务需求选择数据特性，选择对地毯最有用的特征，选择的特征包括：【xxxxxxx】
2. 数据标注：将【】标注为目标变量，并标注积极性评价划分为0和1
3. 数据划分： 将数据集划分成80%的训练集和20%测试机
4. 数据保存： 使用to_csv保存文件

# 数据加载 数据预览 缺失值处理 重复纸处理 数据标准化 特征选择 数据标注 数据划分 数据保存