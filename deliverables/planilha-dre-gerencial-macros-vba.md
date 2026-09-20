# Macros VBA opcionais — Planilha de DRE Gerencial

A planilha (`.xlsx`) funciona inteira sem macro — fórmulas nativas, sem aviso de
segurança, abre em qualquer computador. Este arquivo é **opcional**, para quem
quer automatizar duas tarefas manuais. O código abaixo não foi executado por
quem o gerou (ambiente sem Excel/VBA disponível) — revise antes de usar, como
faria com qualquer macro de terceiros.

## Como instalar

1. Abra a planilha no Excel (Windows ou Mac).
2. Salve uma cópia como **Pasta de Trabalho Habilitada para Macro (.xlsm)** —
   `Arquivo → Salvar Como → Tipo: .xlsm`. A macro só funciona nesse formato.
3. Pressione **Alt+F11** para abrir o Editor VBA.
4. No painel à esquerda, clique com o botão direito na sua planilha →
   **Inserir → Módulo**.
5. Cole o código de uma das macros abaixo no módulo novo.
6. Feche o Editor VBA (Alt+Q) e salve o arquivo (Ctrl+S, mantendo .xlsm).
7. (Opcional) Para rodar com um clique: guia **Desenvolvedor** → **Inserir**
   → **Botão (Controle de Formulário)** → desenhe o botão em qualquer aba →
   na caixa que abrir, associe à macro (`AdicionarFornecedor` ou
   `ExportarDREParaPDF`).
   - Se a guia Desenvolvedor não aparecer: `Arquivo → Opções → Personalizar
     Faixa de Opções → marque "Desenvolvedor"`.

Sem o botão, dá para rodar direto por **Alt+F8** → selecione o nome da
macro → **Executar**.

---

## Macro 1 — Adicionar Fornecedor

Insere uma nova linha de fornecedor logo abaixo da linha selecionada, dentro
do mesmo subgrupo, copiando a formatação (zebra, cor de fonte azul). O Excel
expande sozinho o `SOMA()` do "Subtotal — <subgrupo>" logo abaixo, porque a
inserção acontece dentro do intervalo somado — comportamento nativo do
Excel, não precisa reescrever fórmula nenhuma.

**Uso:** clique em qualquer célula de uma linha de fornecedor já existente
(não em uma linha de Subtotal ou Total) e rode a macro. A nova linha aparece
logo abaixo, pronta para você digitar o nome do fornecedor e os valores.

```vb
Sub AdicionarFornecedor()
    ' Insere uma nova linha de fornecedor logo abaixo da linha selecionada,
    ' dentro do mesmo subgrupo. O Excel expande automaticamente o SOMA() do
    ' Subtotal do subgrupo, pois a inserção cai dentro do intervalo somado.
    Dim ws As Worksheet
    Dim linha As Long

    Set ws = ActiveSheet
    linha = ActiveCell.Row

    If InStr(1, ws.Cells(linha, 1).Value, "Subtotal") > 0 _
       Or InStr(1, ws.Cells(linha, 1).Value, "TOTAL") > 0 _
       Or ws.Cells(linha, 1).Value = "" Then
        MsgBox "Selecione uma linha de FORNECEDOR já existente (não uma linha de " & _
               "Subtotal, Total ou uma linha vazia) e rode a macro de novo.", vbExclamation
        Exit Sub
    End If

    ws.Rows(linha + 1).Insert Shift:=xlDown, CopyOrigin:=xlFormatFromLeftOrAbove
    ws.Cells(linha + 1, 1).Value = "Novo Fornecedor"
    ws.Cells(linha + 1, 1).Select

    MsgBox "Linha inserida. Renomeie o fornecedor na coluna A e preencha os valores " & _
           "mensais (texto azul). O subtotal do subgrupo já foi ajustado.", vbInformation
End Sub
```

**Depois de rodar:** confira visualmente se a fórmula de
`Subtotal — <subgrupo>` (célula da coluna do último mês, por exemplo) agora
cobre a linha nova — clique nela e olhe a barra de fórmulas. Se por algum
motivo não cobrir (por exemplo, se você inseriu a linha fora dos limites do
subgrupo), ajuste o intervalo do `SOMA()` manualmente.

---

## Macro 2 — Exportar DRE Macro em PDF

Exporta só a aba "DRE Macro" (a visão consolidada) para um PDF na mesma
pasta do arquivo, com o mês/ano no nome — útil para levar para reunião sem
mandar a planilha inteira.

```vb
Sub ExportarDREParaPDF()
    Dim caminho As String
    caminho = ThisWorkbook.Path & "\DRE Macro - " & Format(Date, "yyyy-mm") & ".pdf"

    ThisWorkbook.Sheets("DRE Macro").ExportAsFixedFormat _
        Type:=xlTypePDF, _
        Filename:=caminho, _
        Quality:=xlQualityStandard, _
        OpenAfterPublish:=True

    MsgBox "PDF exportado em:" & vbCrLf & caminho, vbInformation
End Sub
```

Se preferir que o PDF não abra sozinho depois de exportar, troque
`OpenAfterPublish:=True` por `OpenAfterPublish:=False`.
