import re

file_path = r'C:\Users\User\Videos\project\backend\systemSchool\jomorais-frontend\src\utils\CertificateWordGenerator.ts'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Refactor generate9thClassWord
# change definition
content = re.sub(
    r'private static async generate9thClassWord\(data: ICertificatePdfData\): Promise<void> \{',
    r'''private static async build9thClassSection(data: ICertificatePdfData, logoBuffer: ArrayBuffer | undefined): Promise<any> {''',
    content
)

# remove loadLogo inside 9thClass
content = re.sub(
    r'const logoBuffer = await this.loadLogo\(\)\n',
    r'',
    content,
    count=1
)

# Replace doc creation and download at the end of 9th class
content = re.sub(
    r'const doc = new Document\(\{\s+sections: \[\s+\{([\s\S]*?)children:\s+\[([\s\S]*?)\]\,\s+\}\s+\]\,\s+\}\)\s+const blob = await Packer\.toBlob\(doc\)\s+this\.downloadBlob\(blob, `Certificado_9a_\$\{nomeAluno\.replace\(/\\s\+/g, \'_-\'\)\}\.docx`\)',
    r'''return {
          \1
          children: [\2],
        };''',
    content
)

content = re.sub(
    r'const doc = new Document\(\{\s+sections: \[\s+\{([\s\S]*?)children:\s+\[([\s\S]*?)\]\,\s+\}\s+\]\,\s+\}\)\s+const blob = await Packer\.toBlob\(doc\)\s+this\.downloadBlob\(blob, `Certificado_9a_\$\{nomeAluno\.replace\(/\\s\+/g, \'_'\)\}\.docx`\)',
    r'''return {
          \1
          children: [\2],
        };''',
    content
)

# Let's do it with more robust regex or just manual replace
