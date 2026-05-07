"use client";

import React, { useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Printer, Download, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import Barcode from "react-barcode";
import { Modal, Button } from "@/components/ui";
import { OrderResponse } from "@/services/orders.service";
import { UI_LABELS } from "@/constants/ui";
import { formatCurrency, formatDate, formatTime } from "@/lib/utils";

interface ClaimStubProps {
  isOpen: boolean;
  onClose: () => void;
  order: OrderResponse | null;
}

/**
 * ClaimStub — Professional Thermal Receipt (Requirement 1.5).
 * Uses React Portal for robust "Isolation Printing" to avoid dashboard layout interference.
 * Hardened for 80mm thermal hardware.
 */
export function ClaimStub({ isOpen, onClose, order }: ClaimStubProps) {
  const stubRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = async () => {
    if (!stubRef.current) return;
    setDownloading(true);
    try {
      const { toPng } = await import("html-to-image");
      const dataUrl = await toPng(stubRef.current, {
        backgroundColor: "#ffffff",
        pixelRatio: 2,
        style: { borderRadius: '0' }
      });
      const link = document.createElement("a");
      link.download = `receipt-${order.referenceNumber}.png`;
      link.href = dataUrl;
      link.click();
      toast.success(UI_LABELS.modules.orders.RECEIPT_SAVED);
    } catch (err) {
      toast.error(UI_LABELS.modules.orders.RECEIPT_DOWNLOAD_FAILED);
    } finally {
      setDownloading(false);
    }
  };  // The Receipt Content (Shared between UI and Print)
  const ReceiptContent = ({ isPrint = false }: { isPrint?: boolean }) => (
    <div
      id={isPrint ? "printable-receipt-isolated" : "printable-receipt"}
      className={`bg-white font-mono ${isPrint ? "p-0" : "p-8"} text-black w-full`}
      style={{ width: isPrint ? "100%" : "auto" }}
    >
      {/* ── HEADER ── */}
      <div className="text-center space-y-2 pb-6 border-b-2 border-black">
        <h1 className="text-3xl font-black tracking-tight uppercase leading-none">
          {UI_LABELS.meta.APP_NAME}
        </h1>
        <div className="text-[10px] font-bold uppercase leading-tight tracking-wide">
          <p>SITIO ILAYA, TABUC SUBA, JARO, ILOILO CITY</p>
          <p>+63 929 155 4954</p>
        </div>
      </div>

      {/* ── REFERENCE BLOCK ── */}
      <div className="py-8 text-center space-y-2 border-b-2 border-black bg-black text-white -mx-0">
        <div className="text-[10px] font-black uppercase tracking-[0.4em] opacity-80">
          CLAIM STUB
        </div>
        <div className="text-3xl font-black tracking-tight leading-none">
          {order.referenceNumber}
        </div>
      </div>

      {/* ── CORE DETAILS (Monospace Alignment) ── */}
      <div className="py-6 space-y-3 border-b border-black text-[11px] font-bold uppercase">
        {[
          { label: "CUSTOMER", value: order.customerName || "WALK-IN" },
          { label: "RECEIVED", value: `${formatDate(order.createdAt!)} ${formatTime(order.createdAt!)}` },
          { label: "READY BY", value: formatDate(new Date(new Date(order.createdAt!).getTime() + 24 * 60 * 60 * 1000).toISOString()) },
          { label: "STAFF", value: order.createdByUsername || "ADMIN" },
        ].map((row, i) => (
          <div key={i} className="flex justify-between items-start gap-4">
            <span className="whitespace-nowrap text-slate-900">{row.label}:</span>
            <span className="text-right flex-1">{row.value}</span>
          </div>
        ))}
      </div>

      {/* ── SERVICE BREAKDOWN ── */}
      <div className="py-6 border-b border-black space-y-4">
        <div className="flex justify-between text-[11px] font-black tracking-widest border-b border-black pb-1">
          <span>ITEM / SERVICE</span>
          <span>PRICE</span>
        </div>

        <div className="space-y-2 text-[11px]">
          <div className="flex justify-between leading-tight">
            <span className="flex-1 pr-2">
              <span className="font-black text-xs block mb-0.5">
                {order.totalLoads} {order.totalLoads === 1 ? UI_LABELS.shared.units.LOAD : UI_LABELS.shared.units.LOADS} @ {order.weightKg?.toLocaleString(undefined, { maximumFractionDigits: 2 })}KG
              </span>
              <span className="text-[10px] font-medium opacity-70">{order.serviceType?.replace(/_/g, " ")}</span>
            </span>
            <span className="whitespace-nowrap font-black">{formatCurrency(order.baseAmount)}</span>
          </div>

          {(order.extraMinutes ?? 0) > 0 && (
            <div className="flex justify-between font-bold">
              <span>EXTRA MINUTES ({order.extraMinutes} MINS)</span>
              <span>{formatCurrency(order.extraMinutesAmount)}</span>
            </div>
          )}

          {order.addOns && order.addOns.length > 0 ? (
            <div className="pt-3 mt-2 border-t border-dashed border-black">
              <span className="text-[10px] font-black uppercase block mb-1">Add-ons</span>
              {order.addOns.map((a, i) => (
                <div key={i} className="flex justify-between italic text-[11px] font-medium">
                  <span>{a.name} (X{a.quantity})</span>
                  <span>{formatCurrency((a.price || 0) * (a.quantity || 1))}</span>
                </div>
              ))}
            </div>
          ) : (order.addonsTotalAmount ?? 0) > 0 ? (
            <div className="pt-3 mt-2 border-t border-dashed border-black flex justify-between text-[11px]">
              <span className="font-black uppercase">Add-ons Total</span>
              <span className="font-bold">{formatCurrency(order.addonsTotalAmount)}</span>
            </div>
          ) : null}
        </div>
      </div>

      {/* ── TOTALS ── */}
      <div className="py-6 space-y-3">
        <div className="flex justify-between text-[11px] font-bold">
          <span>SUBTOTAL:</span>
          <span>{formatCurrency((order.baseAmount || 0) + (order.extraMinutesAmount || 0) + (order.addonsTotalAmount || 0))}</span>
        </div>
        <div className="flex justify-between text-xl font-black border-t-2 border-black pt-4">
          <span className="tracking-tight uppercase">Grand Total:</span>
          <span className="text-2xl">{formatCurrency(order.grandTotal)}</span>
        </div>

        <div className="pt-4 space-y-2 text-[11px] font-bold uppercase tracking-tight">
          <div className="flex justify-between">
            <span>PAYMENT STATUS:</span>
            <span className="font-black">
              {order.paymentStatus === "PAID" ? "FULLY PAID" : "UNPAID"}
            </span>
          </div>

          <div className="flex justify-between border-t border-dashed border-black pt-2 font-black text-sm bg-slate-50 px-2 py-1 rounded mt-2">
            <span>BALANCE DUE:</span>
            <span>{formatCurrency(order.paymentStatus === "PAID" ? 0 : order.grandTotal)}</span>
          </div>
        </div>
      </div>

      {/* ── LEGAL & TERMS ── */}
      <div className="pt-6 text-[9px] font-bold leading-relaxed text-justify uppercase space-y-4">
        <div className="border-t-2 border-black pt-4">
          <p className="font-black text-center text-xs mb-2">TERMS AND CONDITIONS</p>
          <ol className="list-decimal pl-5 space-y-2">
            <li>PRESENT THIS STUB TO CLAIM LAUNDRY. NO STUB, NO RELEASE.</li>
            <li>NOT RESPONSIBLE FOR COLOR BLEED, SHRINKAGE, OR BUTTON LOSS.</li>
            <li>LIABILITY FOR LOST ITEMS IS LIMITED TO 3X THE SERVICE FEE.</li>
            <li>UNCLAIMED ITEMS AFTER 30 DAYS WILL BE DISPOSED OR DONATED.</li>
            <li>CHECK ALL ITEMS UPON CLAIMING. NO COMPLAINTS AFTER RELEASE.</li>
            <li>UNPAID ORDERS MUST BE SETTLED BEFORE RELEASING ITEMS.</li>
          </ol>
        </div>

        {/* ── CUSTOMER SIGNATURE ── */}
        <div className="pt-14 space-y-3">
          <div className="border-b-2 border-black w-full" />
          <p className="text-center font-black text-[10px]">CUSTOMER SIGNATURE</p>
        </div>

        {/* ── FOOTER ── */}
        <div className="pt-10 text-center space-y-6">
          <div className="flex flex-col items-center justify-center">
            <div className="bg-white p-2 border border-black rounded">
              <Barcode
                value={order.referenceNumber}
                width={1.5}
                height={50}
                fontSize={12}
                margin={0}
                background="transparent"
                format="CODE128"
              />
            </div>
          </div>

          <div className="text-[11px] font-black tracking-tight pt-4 border-t border-black">
            THANK YOU FOR TRUSTING<br />
            FAITH LAUNDRY SHOP!
          </div>
        </div>
      </div>
    </div>
  );
  ;

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Order Receipt"
        size="md"
        className="receipt-modal-root"
      >
        <div className="p-6 space-y-6">
          <div
            ref={stubRef}
            className="bg-white border-[1.5px] border-slate-200 rounded-2xl overflow-hidden print:hidden"
          >
            <ReceiptContent />
          </div>

          {/* Action Bar */}
          <div className="flex gap-3 print:hidden">
            <Button
              variant="secondary"
              size="lg"
              className="flex-1 h-14 uppercase tracking-widest font-black text-[10px] rounded-2xl"
              onClick={onClose}
            >
              Done
            </Button>

            <Button
              variant="secondary"
              size="lg"
              className="flex-1 h-14 uppercase tracking-widest font-black text-[10px] rounded-2xl border-slate-200"
              onClick={handleDownload}
              isLoading={downloading}
            >
              <Download className="h-4 w-4 mr-2" />
              Save
            </Button>

            <Button
              variant="primary"
              size="lg"
              className="flex-[2] h-14 uppercase tracking-widest font-black text-[10px] rounded-2xl bg-slate-900 hover:bg-slate-800"
              onClick={handlePrint}
            >
              <Printer className="h-5 w-5 mr-2" />
              Print
            </Button>
          </div>
        </div>
      </Modal>

      {/* --- PRINT PORTAL (HCI-Optimized Isolation) --- */}
      {isMounted && isOpen && createPortal(
        <div id="print-portal-container" className="hidden print:block fixed inset-0 bg-white z-[9999]">
          <div className="w-[80mm] mx-auto p-4 bg-white">
            <ReceiptContent isPrint={true} />
          </div>
          <style dangerouslySetInnerHTML={{
            __html: `
            @media print {
              @page {
                size: auto;
                margin: 0mm;
              }

              /* Hide standard dashboard elements */
              body > *:not(#print-portal-container) { display: none !important; }
              
              /* Show ONLY this portal */
              #print-portal-container { 
                display: block !important; 
                visibility: visible !important; 
                position: absolute !important;
                left: 0 !important;
                top: 0 !important;
                width: 80mm !important;
              }
              
              #print-portal-container * { visibility: visible !important; }
              
              html, body {
                height: auto !important;
                background: white !important;
                margin: 0 !important;
                padding: 0 !important;
                width: 80mm !important;
                overflow: visible !important;
              }
            }
          `}} />
        </div>,
        document.body
      )}
    </>
  );
}
