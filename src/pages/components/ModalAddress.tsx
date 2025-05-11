import React, { useState ,ChangeEvent} from 'react';
import {Button, Modal, Input, message} from 'antd';
import {ethers} from "ethers";
const { TextArea } = Input;

type AppData = {
  onOk:Function;
}

const App: React.FC<AppData> = ({onOk}:AppData) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [value, setValue] = useState();


  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    if(!value){
      message.error("请输入地址");
      return;
    }

    let str = value.split("\n");
    const strArr = []
    for(let i=0;i<str.length;i++){
      let strs = str[i].trim();
      if(ethers.isHexString(strs,20)){
        strArr.push(strs)
      }
    }
    onOk && onOk(strArr)
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <Button type="primary" onClick={showModal}>录入地址</Button>
      <Modal
        title="Basic Modal"
        closable={{ 'aria-label': 'Custom Close Button' }}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <TextArea rows={4} placeholder="maxLength is 6" onChange={e=>setValue(e.target.value)}/>
      </Modal>
    </>
  );
};

export default App;