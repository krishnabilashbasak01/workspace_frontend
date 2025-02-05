import { Button } from "@/components/ui/button";
import { useState } from "react";
import Modal, {
  ModalHead,
  ModalMain,
  ModalClose,
  ModalBody,
  ModalFooter,
} from "../components/app/Modal";
import { CircleX, Plus } from "lucide-react";
function Calendar() {
  const [modalOpen, setModalOpen] = useState(false);
  const onModalOpen = () => [setModalOpen(!modalOpen)];
  return (
    <>
      <h1>Calendar</h1>
      <Button onClick={() => onModalOpen()}> Modal Open</Button>
      <Modal key={`modal`} open={modalOpen} onClose={() => onModalOpen()}>
        <ModalMain className={`w-10/12`}>
          <ModalClose>
            <CircleX />
          </ModalClose>
          <ModalHead>
            {/* Title */}
            <p className={``}>Title</p>
            <Button>
              <Plus />
            </Button>
          </ModalHead>
          {/* Modal Body */}
          <ModalBody>
            <h1>Modal Body</h1>
          </ModalBody>
          <ModalFooter>
            <p>Footer</p>
          </ModalFooter>
        </ModalMain>
      </Modal>
    </>
  );
}

export default Calendar;
