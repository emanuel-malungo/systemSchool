import { useState, useEffect } from 'react'
import { Building, Save } from 'lucide-react'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useInstitutionManager } from '../../../hooks/useInstitution'
import type { IInstitutionInput } from '../../../types/institution.types'
import Container from '../../../components/layout/Container'
import Button from '../../../components/common/Button'
import Input from '../../../components/common/Input'

// Schema de validação
const validationSchema = yup.object({
  nome: yup.string().required('Nome é obrigatório'),
  director: yup.string().required('Diretor é obrigatório'),
  email: yup.string().email('Email inválido').required('Email é obrigatório'),
  nif: yup.string().required('NIF é obrigatório'),
  telefone_Movel: yup.string(),
  telefone_Fixo: yup.string(),
  site: yup.string().url('URL inválida'),
  localidade: yup.string(),
  provincia: yup.string(),
  municipio: yup.string(),
  subDirector: yup.string(),
  contribuinte: yup.string(),
  n_Escola: yup.string(),
  nescola: yup.string(),
  contaBancaria1: yup.string(),
  contaBancaria2: yup.string(),
  contaBancaria3: yup.string(),
  contaBancaria4: yup.string(),
  contaBancaria5: yup.string(),
  contaBancaria6: yup.string(),
  regime_Iva: yup.string(),
  taxaIva: yup.number(),
})

type FormData = IInstitutionInput

export default function InstitutionManagement() {
  const [logoFile, setLogoFile] = useState<File | null>(null)
  // const [logoPreview, setLogoPreview] = useState<string | null>(null)

  const {
    principal,
    isLoading,
    isUpdating,
    isUploading,
    updateInstitutionAsync,
    uploadLogoAsync,
  } = useInstitutionManager()

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: yupResolver(validationSchema) as any,
    defaultValues: {
      nome: '',
      director: '',
      email: '',
      nif: '',
      telefone_Movel: '',
      telefone_Fixo: '',
      site: '',
      localidade: '',
      provincia: '',
      municipio: '',
      subDirector: '',
      contribuinte: '',
      n_Escola: '',
      nescola: '',
      contaBancaria1: '',
      contaBancaria2: '',
      contaBancaria3: '',
      contaBancaria4: '',
      contaBancaria5: '',
      contaBancaria6: '',
      regime_Iva: '',
      taxaIva: 0,
      logotipo: '',
    },
  })

  // Carregar dados da instituição quando disponível
  useEffect(() => {
    if (principal) {
      reset({
        nome: principal.nome || '',
        director: principal.director || '',
        email: principal.email || '',
        nif: principal.nif || '',
        telefone_Movel: principal.telefone_Movel || '',
        telefone_Fixo: principal.telefone_Fixo || '',
        site: principal.site || '',
        localidade: principal.localidade || '',
        provincia: principal.provincia || '',
        municipio: principal.municipio || '',
        subDirector: principal.subDirector || '',
        contribuinte: principal.contribuinte || '',
        n_Escola: principal.n_Escola || '',
        nescola: principal.nescola || '',
        contaBancaria1: principal.contaBancaria1 || '',
        contaBancaria2: principal.contaBancaria2 || '',
        contaBancaria3: principal.contaBancaria3 || '',
        contaBancaria4: principal.contaBancaria4 || '',
        contaBancaria5: principal.contaBancaria5 || '',
        contaBancaria6: principal.contaBancaria6 || '',
        regime_Iva: principal.regime_Iva || '',
        taxaIva: principal.taxaIva || 0,
        logotipo: principal.logotipo || '',
      })
      // if (principal.logotipo) {
      //   setLogoPreview(principal.logotipo)
      // }
    }
  }, [principal, reset])

  const onSubmit = async (data: FormData) => {
    try {
      if (principal?.codigo) {
        await updateInstitutionAsync({ id: principal.codigo, institutionData: data })
        
        // Upload do logo se houver
        if (logoFile) {
          await uploadLogoAsync(logoFile)
          setLogoFile(null)
        }
      }
    } catch (error) {
      console.error('Erro ao salvar dados institucionais:', error)
    }
  }

  // const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const file = e.target.files?.[0]
  //   if (file) {
  //     setLogoFile(file)
  //     const reader = new FileReader()
  //     reader.onloadend = () => {
  //       setLogoPreview(reader.result as string)
  //     }
  //     reader.readAsDataURL(file)
  //   }
  // }

  if (isLoading) {
    return (
      <Container>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#007C00]"></div>
        </div>
      </Container>
    )
  }

  return (
    <Container>
      {/* Header */}
      <div className="mb-8 bg-gradient-to-br from-green-50 via-white to-green-50 rounded-2xl shadow-lg overflow-hidden">
        <div className="relative p-8">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-100/30 rounded-full -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-green-100/30 rounded-full -ml-12 -mb-12"></div>
          
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-[#007C00] to-[#005a00] rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                <Building className="h-8 w-8 text-white" />
              </div>
              
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  Dados Institucionais
                </h1>
                <p className="text-gray-600 text-lg">
                  Configure as informações da sua instituição de ensino
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Formulário */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-6">
          {/* Logo */}
          {/* <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100"> */}
            {/* <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-[#007C00]" />
              Logotipo
            </h2> */}
            
            {/* <div className="flex items-center gap-6"> */}
              {/* Preview do Logo */}
              {/* <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-hidden bg-gray-50">
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo" className="w-full h-full object-contain" />
                ) : (
                  <ImageIcon className="h-12 w-12 text-gray-400" />
                )}
              </div> */}

              {/* Upload */}
              {/* <div className="flex-1">
                <label className="block">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="hidden"
                    id="logo-upload"
                  />
                  <label
                    htmlFor="logo-upload"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg cursor-pointer transition-colors"
                  >
                    <Upload className="h-4 w-4" />
                    Escolher Imagem
                  </label>
                </label>
                <p className="text-sm text-gray-500 mt-2">
                  Formatos aceitos: JPG, PNG, SVG (máx. 2MB)
                </p>
              </div>
            </div> */}
          {/* </div> */}

          {/* Informações Básicas */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Informações Básicas</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Controller
                name="nome"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    label="Nome da Instituição"
                    placeholder="Digite o nome"
                    error={errors.nome?.message}
                    required
                  />
                )}
              />

              <Controller
                name="n_Escola"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    label="Número da Escola"
                    placeholder="Digite o número"
                    error={errors.n_Escola?.message}
                  />
                )}
              />

              <Controller
                name="director"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    label="Diretor"
                    placeholder="Nome do diretor"
                    error={errors.director?.message}
                    required
                  />
                )}
              />

              <Controller
                name="subDirector"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    label="Subdiretor"
                    placeholder="Nome do subdiretor"
                    error={errors.subDirector?.message}
                  />
                )}
              />
            </div>
          </div>

          {/* Contatos */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Contatos</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    type="email"
                    label="Email"
                    placeholder="email@instituicao.com"
                    error={errors.email?.message}
                    required
                  />
                )}
              />

              <Controller
                name="site"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    label="Website"
                    placeholder="https://www.instituicao.com"
                    error={errors.site?.message}
                  />
                )}
              />

              <Controller
                name="telefone_Movel"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    label="Telefone Móvel"
                    placeholder="+244 900 000 000"
                    error={errors.telefone_Movel?.message}
                  />
                )}
              />

              <Controller
                name="telefone_Fixo"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    label="Telefone Fixo"
                    placeholder="+244 222 000 000"
                    error={errors.telefone_Fixo?.message}
                  />
                )}
              />
            </div>
          </div>

          {/* Localização */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Localização</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Controller
                name="provincia"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    label="Província"
                    placeholder="Digite a província"
                    error={errors.provincia?.message}
                  />
                )}
              />

              <Controller
                name="municipio"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    label="Município"
                    placeholder="Digite o município"
                    error={errors.municipio?.message}
                  />
                )}
              />

              <Controller
                name="localidade"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    label="Localidade"
                    placeholder="Digite a localidade"
                    error={errors.localidade?.message}
                  />
                )}
              />
            </div>
          </div>

          {/* Informações Fiscais */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Informações Fiscais</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Controller
                name="nif"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    label="NIF"
                    placeholder="Digite o NIF"
                    error={errors.nif?.message}
                    required
                  />
                )}
              />

              <Controller
                name="contribuinte"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    label="Contribuinte"
                    placeholder="Digite o contribuinte"
                    error={errors.contribuinte?.message}
                  />
                )}
              />

              <Controller
                name="regime_Iva"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    label="Regime IVA"
                    placeholder="Digite o regime"
                    error={errors.regime_Iva?.message}
                  />
                )}
              />

              <Controller
                name="taxaIva"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    type="number"
                    label="Taxa IVA (%)"
                    placeholder="0"
                    error={errors.taxaIva?.message}
                  />
                )}
              />
            </div>
          </div>

          {/* Contas Bancárias */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Contas Bancárias</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4, 5, 6].map((num) => (
                <Controller
                  key={num}
                  name={`contaBancaria${num}` as keyof FormData}
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      label={`Conta Bancária ${num}`}
                      placeholder="Digite o IBAN"
                    />
                  )}
                />
              ))}
            </div>
          </div>

          {/* Botão Salvar */}
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isUpdating || isUploading}
              loading={isUpdating || isUploading}
              className="px-8 py-3 bg-gradient-to-r from-[#007C00] to-[#005a00] hover:from-[#005a00] hover:to-[#004000]"
            >
              <Save className="h-5 w-5" />
              Salvar Alterações
            </Button>
          </div>
        </div>
      </form>
    </Container>
  )
}
