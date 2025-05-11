import React, { useState } from 'react';
import {Button, Divider, Input, message, Modal, Space} from 'antd';
import {JsonRpcSigner} from "ethers/src.ts";
import {ethers} from "ethers";

type AppData = {
  signer:JsonRpcSigner | undefined;
  onOk:Function;
}

const App: React.FC<AppData> = ( {signer, onOk} ) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [balance, setBalance] = useState(false);
  const [value, setValue] = useState<bigint>();

  const showModal = () => {
    signer?.provider.getBalance(signer?.address).then(res=>{
      setBalance(ethers.formatEther(res))
    })
    setIsModalOpen(true);
  };

  const handleOk = () => {
    if(!value){
      message.error("金额输入错误");
      return
    }

    const bigInt = ethers.parseEther(String(value))
    if(bigInt<0){
      message.error("金额输入错误");
      return
    }
    onOk && onOk(bigInt)
    setIsModalOpen(false);
  };

  const handleCancel = () => {

    setIsModalOpen(false);
  };

  return (
    <>
      <Button type="primary" onClick={showModal}>发起转账</Button>
      <Modal
        title="转账金额"
        closable={{ 'aria-label': 'Custom Close Button' }}
        open={isModalOpen}
        onOk={handleOk}
        cancelText="取消"
        okText="确认"
        onCancel={handleCancel}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>转账金额</div>
          <Input onChange={e => setValue(e.target?.value)} placeholder="123" />
        </Space>
        <Divider />
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>可用余额</div>
          <div>{balance}</div>
        </Space>
      </Modal>
    </>
  );
};

export default App;