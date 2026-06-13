import { Document, Packer, Paragraph, TextRun, AlignmentType, ImageRun, Table, TableRow, TableCell, WidthType, BorderStyle, VerticalAlign, PageOrientation, PageBreak } from 'docx'

import icon from '../assets/images/icon.png'
import type { IBoletimTurmaData, IBoletimAlunoData } from './BoletimPdfGenerator'

export class BoletimWordGenerator {
  static async generateWord(data: IBoletimTurmaData) {
    const {
      turma,
      anoLetivo,
      trimestre,
      disciplinas,
      directorTurma,
      contactoDirector,
      instituicao,
      boletins,
    } = data

    // Abbreviate function
    const abbrev = (name: string, maxLen = 8): string => {
      if (!name) return ''
      const MAP: Record<string, string> = {
        'Lingua Portuguesa': 'L. Port.',
        'Língua Portuguesa': 'L. Port.',
        'Lingua Inglesa': 'Inglês',
        'Língua Inglesa': 'Inglês',
        'Matematica': 'Mat.',
        'Matemática': 'Mat.',
        'Biologia': 'Biol.',
        'Fisica': 'Fís.',
        'Física': 'Fís.',
        'Quimica': 'Quím.',
        'Química': 'Quím.',
        'Quimica Organica': 'Qca Org.',
        'Química Orgânica': 'Qca Org.',
        'Microbiologia': 'Microbiol.',
        'Hematologia': 'Hemat.',
        'Imunologia': 'Imunol.',
        'Urinalise': 'Urinol.',
        'Urinálise': 'Urinol.',
        'Urinalise ': 'Urinol.',
        'Parasitologia': 'Parasitol.',
        'Educacao Fisica': 'Ed. Física',
        'Educação Física': 'Ed. Física',
        'Formacao de Atitudes Integradoras': 'A.F.H',
        'Formação de Atitudes Integradoras': 'A.F.H',
        'Formacao de Atitudes': 'A.F.H',
        'Ingles': 'Inglês',
        'Inglês': 'Inglês',
      }
      const found = Object.entries(MAP).find(([k]) =>
        name.toLowerCase().includes(k.toLowerCase())
      )
      if (found) return found[1]
      return name.length > maxLen ? name.substring(0, maxLen - 1) + '.' : name
    }

    // Load icon
    let logoBuffer: ArrayBuffer | undefined
    try {
      const response = await fetch(icon)
      logoBuffer = await response.arrayBuffer()
    } catch (e) {
      console.warn('Could not load logo for Word document', e)
    }

    const trimNum = parseInt(trimestre) || 1
    const romanMap: Record<number, string> = { 1: 'I', 2: 'II', 3: 'III' }
    const trimLabel = `${romanMap[trimNum] || trimNum}-TRIMESTRE`

    const colsDisciplinas = [...disciplinas.slice(0, 12)]

    // Build the document
    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              size: { orientation: PageOrientation.PORTRAIT },
              margin: { top: 700, right: 500, bottom: 700, left: 500 }, // Narrow A4 margins
            }
          },
          children: boletins.flatMap((boletim, index) => {
            const table = this.createBoletimTable(
              boletim,
              turma,
              anoLetivo,
              trimLabel,
              colsDisciplinas,
              instituicao,
              directorTurma,
              contactoDirector,
              logoBuffer,
              abbrev
            )
            
            const isLast = index === boletins.length - 1
            const isFourth = (index + 1) % 4 === 0

            if (isFourth && !isLast) {
              return [table, new Paragraph({ children: [new PageBreak()] })]
            }

            if (isLast) {
              return [table]
            }

            // Empty paragraph as gap between cards
            return [table, new Paragraph({ text: "" }), new Paragraph({ text: "" })]
          })
        }
      ]
    })

    const blob = await Packer.toBlob(doc)
    const nomeTurma = turma.designacao.replace(/\s+/g, '_')
    const fileName = `Boletins_${nomeTurma}_${trimLabel}.docx`
    
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  private static createBoletimTable(
    boletim: IBoletimAlunoData,
    turma: any,
    anoLetivo: string,
    trimLabel: string,
    colsDisciplinas: any[],
    _instituicao: any,
    directorTurma: string,
    contactoDirector: string,
    logoBuffer: ArrayBuffer | undefined,
    abbrev: (n: string) => string
  ): Table {
    const N = colsDisciplinas.length
    const totalCols = N + 3

    // Styles setup
    const font = "Agency FB"
    const size = 22 // 11pt
    const colorRed = "D20000"
    const colorBlue = "0064C8"
    const colorBlack = "000000"
    const colorDanger = "FF0000" // For notes < 10

    // Row 1: Header
    const row1 = new TableRow({
      children: [
        new TableCell({
          columnSpan: totalCols,
          verticalAlign: VerticalAlign.CENTER,
          margins: { top: 60, bottom: 60, left: 100, right: 100 },
          children: [
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              borders: {
                top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                insideVertical: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" }
              },
              rows: [
                new TableRow({
                  children: [
                    new TableCell({
                      width: { size: 15, type: WidthType.PERCENTAGE },
                      borders: {
                        top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                        bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                        left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                        right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" }
                      },
                      children: [
                        new Paragraph({
                          alignment: AlignmentType.LEFT,
                          children: logoBuffer ? [
                            new ImageRun({
                              data: logoBuffer,
                              transformation: { width: 50, height: 20 },
                              type: "png"
                            })
                          ] : []
                        })
                      ]
                    }),
                    new TableCell({
                      width: { size: 70, type: WidthType.PERCENTAGE },
                      verticalAlign: VerticalAlign.CENTER,
                      borders: {
                        top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                        bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                        left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                        right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" }
                      },
                      children: [
                        new Paragraph({
                          alignment: AlignmentType.CENTER,
                          children: [
                            new TextRun({
                              text: ("INSTITUTO TÉCNICO PRIVADO DE SAÚDE JOMORAIS").toUpperCase(),
                              font,
                              size: 22, // 11pt
                              bold: true,
                              color: colorBlack
                            })
                          ]
                        })
                      ]
                    }),
                    new TableCell({
                      width: { size: 15, type: WidthType.PERCENTAGE },
                      borders: {
                        top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                        bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                        left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                        right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" }
                      },
                      children: [new Paragraph({ text: "" })]
                    }),
                  ]
                })
              ]
            })
          ]
        })
      ]
    })

    // Row 2: Info
    const row2 = new TableRow({
      children: [
        new TableCell({
          columnSpan: totalCols,
          verticalAlign: VerticalAlign.CENTER,
          margins: { top: 60, bottom: 60, left: 100, right: 100 },
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({ text: "ANO LECTIVO: ", font, size, bold: true, color: colorRed }),
                new TextRun({ text: `${anoLetivo}       `, font, size, bold: true, color: colorBlack }),
                new TextRun({ text: "CLASSE: ", font, size, bold: true, color: colorRed }),
                new TextRun({ text: `${turma.classe ? turma.classe + 'ª' : '-'}       `, font, size, bold: true, color: colorBlack }),
                new TextRun({ text: "CURSO: ", font, size, bold: true, color: colorRed }),
                new TextRun({ text: `${turma.curso || '-'}       `, font, size, bold: true, color: colorBlack }),
                new TextRun({ text: "SALA: ", font, size, bold: true, color: colorRed }),
                new TextRun({ text: `${turma.sala || turma.designacao}       `, font, size, bold: true, color: colorBlack }),
                new TextRun({ text: "PERIODO: ", font, size, bold: true, color: colorRed }),
                new TextRun({ text: `${(turma.periodo || '').toUpperCase()}       `, font, size, bold: true, color: colorBlack }),
                new TextRun({ text: `${trimLabel}`, font, size, bold: true, color: colorRed }),
              ]
            })
          ]
        })
      ]
    })

    // Row 3: Column Headers
    const row3Cells = [
      new TableCell({
        verticalAlign: VerticalAlign.CENTER,
        margins: { top: 60, bottom: 60, left: 40, right: 40 },
        children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Nº", font, size, bold: true, italics: true, color: colorBlack })] })]
      }),
      new TableCell({
        verticalAlign: VerticalAlign.CENTER,
        margins: { top: 60, bottom: 60, left: 40, right: 40 },
        children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "NOME", font, size, bold: true, italics: true, color: colorBlack })] })]
      })
    ]
    colsDisciplinas.forEach(disc => {
      row3Cells.push(new TableCell({
        verticalAlign: VerticalAlign.CENTER,
        margins: { top: 60, bottom: 60, left: 40, right: 40 },
        children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: disc.abreviatura || abbrev(disc.designacao), font, size, bold: true, color: colorBlue })] })]
      }))
    })
    row3Cells.push(new TableCell({
      verticalAlign: VerticalAlign.CENTER,
      margins: { top: 60, bottom: 60, left: 40, right: 40 },
      children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "OBS", font, size, bold: true, color: colorBlack })] })]
    }))
    const row3 = new TableRow({ children: row3Cells })

    // Row 4: Data
    const row4Cells = [
      new TableCell({
        verticalAlign: VerticalAlign.CENTER,
        margins: { top: 60, bottom: 60, left: 40, right: 40 },
        children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: String(boletim.numero), font, size, bold: true, color: colorBlack })] })]
      }),
      new TableCell({
        verticalAlign: VerticalAlign.CENTER,
        margins: { top: 60, bottom: 60, left: 60, right: 40 }, // Left aligned with padding
        children: [new Paragraph({ alignment: AlignmentType.LEFT, children: [new TextRun({ text: boletim.aluno.nome, font, size: 20, color: colorBlack })] })]
      })
    ]
    colsDisciplinas.forEach(disc => {
      const notaObj = boletim.notas.find(n => n.codigoDisciplina === disc.codigo)
      const notaVal = notaObj?.nota
      let notaStr = "-"
      let notaColor = colorBlue
      if (notaVal !== undefined && notaVal !== null) {
        notaStr = notaVal.toFixed(1).replace('.', ',')
        if (notaVal < 10) notaColor = colorDanger
      }
      row4Cells.push(new TableCell({
        verticalAlign: VerticalAlign.CENTER,
        margins: { top: 60, bottom: 60, left: 40, right: 40 },
        children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: notaStr, font, size, bold: true, color: notaColor })] })]
      }))
    })
    const isTransita = boletim.situacao === 'TRANSITA'
    row4Cells.push(new TableCell({
      verticalAlign: VerticalAlign.CENTER,
      margins: { top: 60, bottom: 60, left: 40, right: 40 },
      children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: boletim.situacao, font, size, bold: true, color: isTransita ? colorBlue : colorDanger })] })]
    }))
    const row4 = new TableRow({ children: row4Cells })

    // Row 5: Footer
    const row5 = new TableRow({
      children: [
        new TableCell({
          columnSpan: 2, // Nº and NOME
          verticalAlign: VerticalAlign.CENTER,
          margins: { top: 40, bottom: 40, left: 40, right: 40 },
          children: [new Paragraph({ alignment: AlignmentType.LEFT, children: [new TextRun({ text: `Comportamento: ${boletim.comportamento}`, font, size: 20, color: colorBlack })] })]
        }),
        new TableCell({
          columnSpan: N, // Disciplines
          verticalAlign: VerticalAlign.CENTER,
          margins: { top: 40, bottom: 40, left: 40, right: 40 },
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({ text: "Faltas: ", font, size, bold: true, color: colorBlue }),
                new TextRun({ text: `${boletim.faltas}                                        `, font, size, bold: true, color: colorBlue }),
                new TextRun({ text: "Directora de turma: ", font, size, bold: true, color: colorBlue }),
                new TextRun({ text: directorTurma, font, size, bold: true, color: colorBlue })
              ]
            })
          ]
        }),
        new TableCell({
          columnSpan: 1, // OBS
          verticalAlign: VerticalAlign.CENTER,
          margins: { top: 40, bottom: 40, left: 40, right: 40 },
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({ text: "Contacto: ", font, size, bold: true, color: colorRed }),
                new TextRun({ text: contactoDirector, font, size, bold: true, color: colorBlack })
              ]
            })
          ]
        })
      ]
    })

    // Adjusted column widths for A4 Portrait (Total ~10900 DXA)
    const colWidths = [
      400, // Nº
      2900, // NOME
      ...colsDisciplinas.map(() => 550), // 12 Disciplines
      1000 // OBS
    ]

    return new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      columnWidths: colWidths,
      borders: {
        top: { style: BorderStyle.DOUBLE, size: 6, color: colorBlack },
        bottom: { style: BorderStyle.DOUBLE, size: 6, color: colorBlack },
        left: { style: BorderStyle.DOUBLE, size: 6, color: colorBlack },
        right: { style: BorderStyle.DOUBLE, size: 6, color: colorBlack },
        insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: colorBlack },
        insideVertical: { style: BorderStyle.SINGLE, size: 4, color: colorBlack }
      },
      rows: [row1, row2, row3, row4, row5]
    })
  }
}
