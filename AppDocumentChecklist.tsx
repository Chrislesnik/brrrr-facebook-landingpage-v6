"use client";

import React from "react";
import {domAnimation, LazyMotion, m} from "framer-motion";

import MultistepSidebar from "./multistep-sidebar";
import {ButtonWithBorderGradient} from "./button-with-border-gradient";
import {Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Input, Button} from "@heroui/react";
import docChecklistPdfUrl from "./document-checklist.pdf";

const variants = {
  enter: (direction: number) => ({
    y: direction > 0 ? 30 : -30,
    opacity: 0,
  }),
  center: {
    zIndex: 1,
    y: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    zIndex: 0,
    y: direction < 0 ? 30 : -30,
    opacity: 0,
  }),
};

export default function AppDocumentChecklist() {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [hasProvidedContact, setHasProvidedContact] = React.useState(false);

  const downloadUrl = React.useMemo(() => {
    if (typeof window === "undefined") return "";
    return new URLSearchParams(window.location.search).get("download") || docChecklistPdfUrl;
  }, []);

  const formatUsPhone = (raw: string): string => {
    const digits = raw.replace(/\D/g, "").slice(0, 10);
    const a = digits.slice(0, 3);
    const b = digits.slice(3, 6);
    const c = digits.slice(6, 10);
    if (!digits) return "";
    if (digits.length <= 3) return `(${a}`;
    if (digits.length <= 6) return `(${a}) ${b}`;
    return `(${a}) ${b}-${c}`;
  };
  const handlePhoneChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    setPhone(formatUsPhone(e.target.value));
  };

  const canSubmit =
    firstName.trim() &&
    lastName.trim() &&
    email.trim() &&
    phone.replace(/\D/g, "").length === 10;

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = localStorage.getItem("leadMagnetContactProvided") === "true";
      if (stored) setHasProvidedContact(true);
    } catch {
      // ignore
    }
  }, []);

  const startDownload = React.useCallback(() => {
    const target = downloadUrl;
    try {
      if (target) window.open(target, "_blank");
    } catch {
      // ignore
    }
  }, [downloadUrl]);

  const onClickDownload = () => {
    if (hasProvidedContact) {
      startDownload();
      return;
    }
    setIsModalOpen(true);
  };

  const onSubmitContact = async () => {
    if (!canSubmit || isSubmitting) return;
    setIsSubmitting(true);
    try {
      try {
        await fetch("https://n8n.axora.info/webhook/51fcc485-e65e-4a22-b044-237c6094be75", {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify({
            variant: "document-checklist",
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email: email.trim(),
            phone: phone.trim(),
            source: window.location.href,
            userAgent: navigator.userAgent,
            ts: Date.now(),
          }),
        });
      } catch {
        // ignore webhook errors
      }
      localStorage.setItem("leadMagnetContactProvided", "true");
      localStorage.setItem(
        "leadMagnetContact",
        JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          ts: Date.now(),
        }),
      );
      setHasProvidedContact(true);
      setIsModalOpen(false);
      startDownload();
    } catch {
      // ignore
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MultistepSidebar
      currentPage={0}
      onBack={() => {}}
      onChangePage={() => {}}
      onNext={() => {}}
    >
      <div className="relative flex h-fit w-full flex-col pt-6 text-left lg:h-full lg:justify-center lg:pt-0">
        <LazyMotion features={domAnimation}>
          <m.div
            key="document-checklist"
            animate="center"
            className="col-span-12"
            custom={0}
            exit="exit"
            initial="exit"
            transition={{
              y: {
                ease: "backOut",
                duration: 0.35,
              },
              opacity: {duration: 0.4},
            }}
            variants={variants}
          >
            <div className="flex flex-col gap-3">
              <div className="text-default-foreground text-3xl leading-9 font-bold">
                Get Your Free Document Checklist
              </div>
              <div className="text-default-500 -mt-1">
                Essential checklist to organize documents for your real estate deals.
              </div>

              <div
                className="rounded-large shadow-small w-full p-3"
                style={{
                  backgroundImage:
                    "linear-gradient(to right, rgba(255,77,64,0.15), rgba(255,183,3,0.15))",
                }}
              >
                <div className="w-full max-w-[260px] sm:max-w-[320px] md:max-w-[360px] h-[360px] sm:h-[420px] md:h-[480px] mx-auto rounded-medium border border-default-200 overflow-hidden bg-content2/60">
                  <iframe
                    src={
                      docChecklistPdfUrl +
                      "#page=1&zoom=60&toolbar=0&navpanes=0&scrollbar=0"
                    }
                    title="Document Checklist Preview"
                    className="w-full h-full pointer-events-none"
                    scrolling="no"
                    style={{filter: "blur(1.5px)"}}
                  />
                </div>
              </div>

              <div className="mt-1">
                <ButtonWithBorderGradient
                  as="button"
                  className="text-medium font-medium"
                  onClick={onClickDownload}
                >
                  Download Checklist
                </ButtonWithBorderGradient>
              </div>
            </div>
          </m.div>
        </LazyMotion>
        <Modal isOpen={isModalOpen} onOpenChange={setIsModalOpen} backdrop="blur" placement="center">
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  Get the Checklist
                </ModalHeader>
                <ModalBody>
                  <div className="text-default-500 -mt-1 mb-1">
                    Really quick... enter your details below to get your download instantly 👇
                  </div>
                  <div className="grid grid-cols-12 gap-3">
                    <Input
                      className="col-span-12 sm:col-span-6"
                      label="First Name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                    <Input
                      className="col-span-12 sm:col-span-6"
                      label="Last Name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                    <Input
                      className="col-span-12"
                      type="email"
                      label="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    <Input
                      className="col-span-12"
                      type="tel"
                      inputMode="numeric"
                      maxLength={14}
                      label="Phone"
                      value={phone}
                      onChange={handlePhoneChange}
                    />
                  </div>
                </ModalBody>
                <ModalFooter>
                  <Button variant="flat" onPress={onClose}>
                    Cancel
                  </Button>
                  <Button color="primary" className="brand-cta" isDisabled={!canSubmit || isSubmitting} onPress={onSubmitContact}>
                    {isSubmitting ? "Please wait..." : "Continue"}
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      </div>
    </MultistepSidebar>
  );
}


