
# Embedding‑based Soft Jaccard Similarity

## 1. Why “Soft” Jaccard?
Conventional Jaccard similarity treats two tokens as identical **only if the strings match exactly**.  
In recruiting data, aliases or related skills (e.g. *“js”* vs *“JavaScript”*, *“PyTorch”* vs *“pytorch‑lightning”*) should partially match.  
By embedding each token in a semantic vector space and using cosine similarity, we can turn “hard” set membership into a **soft, similarity‑weighted overlap**.

## 2. Formal Definition
Let  

* **A**, **B** be two sets of tokens (skills).  
* **E(a)**, **E(b)** their ℝ<sup>d</sup> embedding vectors (L2‑normalised).  
* **sim(a,b) = E(a) · E(b)** (cosine similarity).  

We define the *soft* intersection weight

\[
I\_{soft}(A,B) \,=\, \sum\_{a\in A} \max\_{b\in B} \bigl[\,\mathbf{1}\_{\{sim(a,b)\ge \tau\}} \cdot
\bigl(\text{weighted? }sim(a,b):1\bigr)\bigr]
\]

where **τ** ∈ (0,1] is a similarity threshold (e.g. 0.8).  
The soft Jaccard index is then  

\[
J\_{soft}(A,B)=
\frac{I\_{soft}(A,B)}
{|A|+|B|-I\_{soft}(A,B)}
\]

*If `weighted=False` we add **1** instead of the raw similarity, making it a binary “fuzzy match”.*

## 3. Algorithm (step‑by‑step)

| Step | Description |
|------|-------------|
| **1 Tokenise** | Split free‑text into lowercase skill tokens, remove punctuation. |
| **2 Embed** | Use a sentence‑embedding model (`all‑MiniLM‑L6‑v2`, OpenAI `text‑embedding‑3‑small`, etc.) and L2‑normalise. |
| **3 Match** | For every token *a* in A compute its **best cosine similarity** against all tokens in B. |
| **4 Intersect** | If *best ≥ τ* accumulate *best* (weighted) or **1** (binary). |
| **5 Union** | `|A| + |B| − intersect` |
| **6 Score** | `intersect / union` |

## 4. Minimal Python Example
```python
from sentence_transformers import SentenceTransformer
import numpy as np

def embed(tokens, model):
    """Return L2‑normalised embeddings (numpy array)."""
    vecs = model.encode(list(tokens), normalize_embeddings=True)
    return np.asarray(vecs)

def soft_jaccard(set_a, set_b, threshold=0.8, weighted=True,
                 model_name='all-MiniLM-L6-v2'):
    """Soft Jaccard between two token sets using embeddings."""
    model = SentenceTransformer(model_name)
    A = embed(set_a, model)   # shape (m,d)
    B = embed(set_b, model)   # shape (n,d)

    intersect = 0.0
    for va in A:
        sims = np.dot(B, va)        # because ||va||=||vb||=1
        best = sims.max()
        if best >= threshold:
            intersect += best if weighted else 1.0

    union = len(A) + len(B) - intersect
    return intersect / union if union else 0.0


if __name__ == "__main__":
    candidate = {"python", "pandas", "sql", "docker"}
    job_post  = {"python", "aws", "sql", "spark"}

    score = soft_jaccard(candidate, job_post,
                         threshold=0.8, weighted=True)
    print(f"Soft Jaccard = {score:.4f}")
```

### Requirements
```bash
pip install sentence-transformers numpy
```

*Execution time*: a few hundred ms for ≤100 tokens.  
*Cost (OpenAI embeddings)*: `tokens × $0.00002` (text‑embedding‑3‑small) per set.

## 5. Choosing Parameters
| Parameter | Typical | Effect |
|-----------|---------|--------|
| **τ (threshold)** | 0.75–0.85 | Lower → more matches, higher → stricter |
| **weighted** | `True` | If `False`, every fuzzy match counts as **1** (binary) |
| **Embedding model** | `all‑MiniLM‑L6‑v2` (SBERT) | Free, local; good enough for tech terms<br>OpenAI for consistent SaaS |

## 6. When to Use
* Matching **skills** (*JS* ↔ *JavaScript*, *React* ⊂ *JS*)  
* **Product catalog** de‑duplication (colours → colour)  
* **Hashtag** clustering  

Soft Jaccard keeps the intuitive “overlap ÷ union” interpretation **while
respecting semantic similarity**—ideal for CV ↔ Job‑description matching.
