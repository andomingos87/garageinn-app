Analise este bug de forma sistêmica, não pontual.

Este erro não deve ser tratado como um caso isolado, pois faz parte de um conjunto de comportamentos dentro do mesmo fluxo/regra de negócio.

Antes de propor qualquer correção, faça:
- Mapeamento do escopo completo afetado;
- Análise lógica do fluxo completo relacionado a este bug;
- Identificação de outros pontos do código que possam sofrer do mesmo problema, mesmo que ainda não tenham sido reportados;
- Proposta de uma correção global/estrutural, não um patch local;
- Avaliação de risco de regressão;

**Não aplique a correção ainda.**
- Primeiro, explique o raciocínio e a solução proposta em alto nível.

**Importante**
- Se a solução for apenas um if ou ajuste local, considere-a incorreta;
- Não escreva código ainda