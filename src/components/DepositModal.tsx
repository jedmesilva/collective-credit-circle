
import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';

type DepositStep = 'select-fund' | 'deposit-details';

const DepositModal: React.FC = () => {
  const { 
    isDepositModalOpen, 
    setIsDepositModalOpen, 
    funds, 
    depositToFund, 
    selectedFundIdForDeposit 
  } = useApp();
  
  const [step, setStep] = useState<DepositStep>('select-fund');
  const [selectedFund, setSelectedFund] = useState<string | null>(selectedFundIdForDeposit);
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('');

  useEffect(() => {
    if (selectedFundIdForDeposit) {
      setSelectedFund(selectedFundIdForDeposit);
      setStep('deposit-details');
    } else {
      setStep('select-fund');
      setSelectedFund(null);
    }
  }, [selectedFundIdForDeposit, isDepositModalOpen]);

  const handleClose = () => {
    setIsDepositModalOpen(false);
    setAmount('');
    setDescription('');
  };

  const handleSelectFund = (fundId: string) => {
    setSelectedFund(fundId);
    setStep('deposit-details');
  };

  const handleDeposit = () => {
    if (!selectedFund) {
      toast({
        title: "Erro",
        description: "Selecione um fundo para fazer o aporte.",
        variant: "destructive"
      });
      return;
    }

    const amountValue = parseFloat(amount.replace(',', '.'));
    
    if (isNaN(amountValue) || amountValue <= 0) {
      toast({
        title: "Valor inválido",
        description: "Por favor, insira um valor válido para o aporte.",
        variant: "destructive"
      });
      return;
    }

    if (!description.trim()) {
      toast({
        title: "Descrição obrigatória",
        description: "Por favor, insira uma descrição para o aporte.",
        variant: "destructive"
      });
      return;
    }

    depositToFund(selectedFund, amountValue, description);
    
    toast({
      title: "Aporte realizado com sucesso!",
      description: `Valor de R$ ${amountValue.toLocaleString('pt-BR')} depositado.`
    });
    
    handleClose();
  };

  const handleBack = () => {
    setStep('select-fund');
  };

  // Get selected fund name for display
  const selectedFundName = selectedFund 
    ? funds.find(f => f.id === selectedFund)?.name 
    : '';

  return (
    <Dialog open={isDepositModalOpen} onOpenChange={setIsDepositModalOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {step === 'select-fund' ? 'Escolha um fundo' : 'Aportar capital'}
          </DialogTitle>
        </DialogHeader>
        
        {step === 'select-fund' ? (
          <div className="py-4 space-y-3">
            {funds.map((fund) => (
              <div
                key={fund.id}
                className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                onClick={() => handleSelectFund(fund.id)}
              >
                <img 
                  src={fund.image} 
                  alt={fund.name} 
                  className="w-12 h-12 rounded-lg object-cover mr-3" 
                />
                <div>
                  <p className="font-medium">{fund.name}</p>
                  <p className="text-sm text-gray-600">{fund.description}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-4 space-y-4">
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-600">Fundo selecionado</p>
              <p className="font-medium">{selectedFundName}</p>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="deposit-amount">Valor do aporte</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">R$</span>
                <Input 
                  id="deposit-amount"
                  className="pl-8" 
                  placeholder="0,00" 
                  type="number"
                  inputMode="decimal"
                  value={amount}
                  onChange={(e) => {
                    // Allow only numbers and one comma
                    const value = e.target.value.replace(/[^\d,]/g, '');
                    // Ensure only one comma
                    const commaCount = (value.match(/,/g) || []).length;
                    if (commaCount <= 1) {
                      setAmount(value);
                    }
                  }}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="deposit-description">Descrição</label>
              <Input 
                id="deposit-description"
                placeholder="Ex: Aporte mensal" 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>
        )}

        <DialogFooter>
          {step === 'select-fund' ? (
            <Button variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
          ) : (
            <div className="flex w-full justify-between">
              <Button variant="outline" onClick={handleBack}>
                Voltar
              </Button>
              <Button onClick={handleDeposit}>
                Concluir aporte
              </Button>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DepositModal;
