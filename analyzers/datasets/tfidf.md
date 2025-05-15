# Python을 이용한 한글 데이터 TF-IDF 기반 상위 10개 단어 추출 튜토리얼

TF-IDF(Term Frequency-Inverse Document Frequency)는 문서 내에서 단어의 중요도를 평가하는 통계적 방법으로, 텍스트 마이닝에서 자주 사용됩니다. 이 튜토리얼에서는 한글 문서에서 TF-IDF를 활용하여 상위 10개 중요 단어를 추출하는 방법을 알아보겠습니다.

## 필요한 라이브러리 설치

먼저 필요한 라이브러리를 설치합니다.

```python
# 필요한 라이브러리 설치
!pip install konlpy
!pip install scikit-learn
!pip install pandas numpy
```

## 기본 코드 구현

### 1. 라이브러리 불러오기

```python
import pandas as pd
import numpy as np
from konlpy.tag import Okt
from sklearn.feature_extraction.text import TfidfVectorizer
import re
from collections import Counter
```

### 2. 텍스트 전처리 함수 정의

```python
def preprocess_text(text):
    # 정규표현식을 사용해 특수문자 및 불필요한 문자 제거
    text = re.sub(r'[^가-힣a-zA-Z0-9\s]', '', text)
    return text
```

### 3. TF-IDF를 이용한 키워드 추출 함수

```python
def extract_keywords_tfidf(documents, top_n=10):
    # 형태소 분석기 초기화
    okt = Okt()
    
    # 문서 전처리 및 형태소 분석
    processed_docs = []
    for doc in documents:
        # 텍스트 전처리
        clean_text = preprocess_text(doc)
        
        # 명사 추출 (동사, 형용사도 포함하려면 pos 함수 사용)
        nouns = okt.nouns(clean_text)
        
        # 한 글자 단어 제거 (의미 없는 단어 필터링)
        nouns = [noun for noun in nouns if len(noun) > 1]
        
        # 형태소 분석 결과를 문자열로 결합
        processed_docs.append(' '.join(nouns))
    
    # TF-IDF 벡터화
    tfidf = TfidfVectorizer()
    tfidf_matrix = tfidf.fit_transform(processed_docs)
    
    # 각 문서별 상위 키워드 추출
    feature_names = np.array(tfidf.get_feature_names_out())
    keywords_per_doc = []
    
    for i, doc in enumerate(tfidf_matrix):
        # 단어별 TF-IDF 점수 정렬
        tfidf_scores = doc.toarray().flatten()
        top_indices = tfidf_scores.argsort()[::-1][:top_n]
        top_keywords = [(feature_names[idx], tfidf_scores[idx]) for idx in top_indices]
        keywords_per_doc.append(top_keywords)
    
    return keywords_per_doc
```

## 예제: 간단한 한글 문서 분석

### 1. 샘플 데이터 준비

```python
# 샘플 한글 문서 데이터
documents = [
    "인공지능은 컴퓨터 과학의 한 분야로 인간의 학습능력과 추론능력을 컴퓨터 프로그램으로 구현한 기술입니다.",
    "머신러닝은 인공지능의 한 분야로 데이터를 기반으로 학습하고 예측하는 알고리즘을 연구합니다.",
    "딥러닝은 여러 비선형 변환기법의 조합을 통해 높은 수준의 추상화를 시도하는 머신러닝 알고리즘입니다.",
    "자연어 처리는 텍스트 분석, 기계번역, 감성분석 등의 작업을 수행하는 인공지능의 한 분야입니다.",
    "빅데이터는 기존 데이터베이스 관리도구의 능력을 넘어서는 대량의 정형 또는 비정형 데이터 집합을 의미합니다."
]

# 키워드 추출
keywords_result = extract_keywords_tfidf(documents)

# 결과 출력
for i, keywords in enumerate(keywords_result):
    print(f"문서 {i+1}의 상위 키워드:")
    for word, score in keywords:
        print(f"  - {word}: {score:.4f}")
    print()
```

## 실제 데이터 활용 예제

실제 데이터를 DataFrame으로 불러와서 사용하는 예제입니다.

```python
# 예: CSV 파일에서 데이터 불러오기 (한글 텍스트가 'text' 열에 있다고 가정)
# df = pd.read_csv('korean_text_data.csv')

# 직접 DataFrame 생성
data = {
    'text': [
        "서울은 대한민국의 수도이자 최대 도시입니다.",
        "부산은 대한민국 제2의 도시이며 항구도시로 유명합니다.",
        "제주도는 한국의 가장 큰 섬이며 아름다운 자연경관으로 관광객이 많이 찾습니다.",
        "경주는 신라의 수도였으며 역사적인 유적지가 많이 있습니다.",
        "전주는 한옥마을과 비빔밥으로 유명한 전통문화의 도시입니다."
    ]
}
df = pd.DataFrame(data)

# TF-IDF 분석 수행
corpus = df['text'].tolist()
keywords_result = extract_keywords_tfidf(corpus)

# 결과 출력
for i, keywords in enumerate(keywords_result):
    print(f"문서 {i+1}의 상위 키워드:")
    for word, score in keywords:
        print(f"  - {word}: {score:.4f}")
    print()
```

## 고급 예제: TF-IDF와 형태소 분석 결합

형태소 분석 결과를 더 세밀하게 제어하는 예제입니다.

```python
def advanced_extract_keywords(documents, top_n=10):
    okt = Okt()
    processed_docs = []
    
    # 품사별 추출 (명사, 동사, 형용사)
    for doc in documents:
        clean_text = preprocess_text(doc)
        
        # 품사 태깅
        pos_tagged = okt.pos(clean_text)
        
        # 원하는 품사만 추출 (명사, 동사, 형용사)
        filtered_words = []
        for word, pos in pos_tagged:
            if pos in ['Noun', 'Verb', 'Adjective'] and len(word) > 1:
                filtered_words.append(word)
        
        processed_docs.append(' '.join(filtered_words))
    
    # TF-IDF 계산
    tfidf = TfidfVectorizer()
    tfidf_matrix = tfidf.fit_transform(processed_docs)
    
    # 각 문서별 상위 키워드 추출
    feature_names = np.array(tfidf.get_feature_names_out())
    
    # 문서별 결과 저장
    results = []
    for i, doc in enumerate(tfidf_matrix):
        # 단어별 TF-IDF 점수
        tfidf_scores = doc.toarray().flatten()
        
        # 상위 n개 키워드 인덱스
        top_indices = tfidf_scores.argsort()[::-1][:top_n]
        
        # 키워드와 점수 추출
        top_keywords = [(feature_names[idx], tfidf_scores[idx]) for idx in top_indices if tfidf_scores[idx] > 0]
        results.append(top_keywords)
    
    return results
```

## 불용어 처리 예제

한국어 불용어를 처리하는 예제입니다.

```python
def extract_keywords_with_stopwords(documents, top_n=10):
    # 한국어 불용어 리스트 (예시)
    korean_stopwords = ['이', '것', '그', '수', '등', '및', '들', '에서', '그리고', '매우', '너무']
    
    okt = Okt()
    processed_docs = []
    
    for doc in documents:
        clean_text = preprocess_text(doc)
        
        # 명사 추출
        nouns = okt.nouns(clean_text)
        
        # 한 글자 단어와 불용어 제거
        filtered_nouns = [noun for noun in nouns if len(noun) > 1 and noun not in korean_stopwords]
        
        processed_docs.append(' '.join(filtered_nouns))
    
    # TF-IDF 계산 (불용어 제거 포함)
    tfidf = TfidfVectorizer(stop_words=korean_stopwords)
    tfidf_matrix = tfidf.fit_transform(processed_docs)
    
    # 각 문서별 상위 키워드 추출
    feature_names = np.array(tfidf.get_feature_names_out())
    keywords_per_doc = []
    
    for i, doc in enumerate(tfidf_matrix):
        tfidf_scores = doc.toarray().flatten()
        top_indices = tfidf_scores.argsort()[::-1][:top_n]
        top_keywords = [(feature_names[idx], tfidf_scores[idx]) for idx in top_indices if tfidf_scores[idx] > 0]
        keywords_per_doc.append(top_keywords)
    
    return keywords_per_doc
```

## 참고사항

1. 한글 데이터 처리 시 형태소 분석기의 성능이 중요합니다. Okt 외에도 Mecab(은전한닢), Komoran 등의 형태소 분석기를 사용할 수 있습니다.

2. 한 글자 단어는 의미가 약한 경우가 많아 제거하는 것이 좋습니다.

3. TF-IDF 값에 따라 상위 단어를 추출할 때 sklearn의 argsort() 함수를 활용하면 편리합니다.

4. 불용어 처리는 분석의 정확도를 높이는 데 중요한 역할을 합니다.

5. 더 정교한 분석을 위해서는 t-SNE나 워드클라우드와 같은 시각화 도구를 활용할 수 있습니다.

이 튜토리얼을 통해 한글 텍스트 데이터에서 TF-IDF를 활용하여 중요 키워드를 추출하는 방법을 배우셨습니다. 실제 데이터 분석에서는 데이터의 특성과 도메인에 맞게 코드를 조정해 사용하시면 됩니다.
