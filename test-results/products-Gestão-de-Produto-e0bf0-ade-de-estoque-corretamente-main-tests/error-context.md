# Page snapshot

```yaml
- generic [ref=e2]:
  - region "Notifications (F8)":
    - list
  - region "Notifications alt+T"
  - generic [ref=e4]:
    - generic [ref=e5]:
      - link "Qexiback" [ref=e6] [cursor=pointer]:
        - /url: /
        - heading "Qexiback" [level=1] [ref=e7]
      - paragraph [ref=e8]: Faça login em sua conta
    - generic [ref=e9]:
      - generic [ref=e10]:
        - heading "Entrar" [level=3] [ref=e11]:
          - img [ref=e12]
          - text: Entrar
        - paragraph [ref=e15]: Digite suas credenciais para acessar sua conta
      - generic [ref=e17]:
        - generic [ref=e18]:
          - text: E-mail
          - textbox "E-mail" [ref=e19]:
            - /placeholder: seu@email.com
            - text: empresa.teste@qexiback.com
        - generic [ref=e20]:
          - text: Senha
          - generic [ref=e21]:
            - textbox "Senha" [ref=e22]:
              - /placeholder: ••••••••
              - text: "123456"
            - button [ref=e23] [cursor=pointer]:
              - img
        - button "Entrar" [ref=e24] [cursor=pointer]
      - paragraph [ref=e26]:
        - text: Não tem uma conta?
        - link "Cadastre-se" [ref=e27] [cursor=pointer]:
          - /url: /register
```