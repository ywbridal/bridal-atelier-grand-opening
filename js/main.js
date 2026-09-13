const opening = document.getElementById("opening");
const video = document.getElementById("openingVideo");

/* Countdown */
const target = new Date("2026-10-11T10:00:00+09:00").getTime();
function countdown(){
  const diff = target-Date.now();
  if(diff<=0){
    ["days","hours","minutes","seconds"].forEach(id=>document.getElementById(id).textContent="0");
    return;
  }
  const d=Math.floor(diff/86400000), h=Math.floor(diff%86400000/3600000), m=Math.floor(diff%3600000/60000), s=Math.floor(diff%60000/1000);
  document.getElementById("days").textContent=d;
  document.getElementById("hours").textContent=String(h).padStart(2,"0");
  document.getElementById("minutes").textContent=String(m).padStart(2,"0");
  document.getElementById("seconds").textContent=String(s).padStart(2,"0");
}
countdown(); setInterval(countdown,1000);

/* Gallery lightbox */
const lightbox=document.getElementById("lightbox");
const lightboxImage=document.getElementById("lightboxImage");
document.querySelectorAll(".photo-card").forEach(btn=>{
  btn.addEventListener("click",()=>{
    lightboxImage.src=btn.dataset.photo;
    lightbox.showModal();
  });
});
document.getElementById("closeLightbox").addEventListener("click",()=>lightbox.close());
lightbox.addEventListener("click",e=>{if(e.target===lightbox)lightbox.close()});

/* RSVP — submits directly to the connected Google Form */
document.getElementById("rsvpForm").addEventListener("submit", async e=>{
  e.preventDefault();
  const form=e.currentTarget;
  const data=new FormData(form);
  const note=document.getElementById("formNote");
  const submitButton=form.querySelector(".submit-button");
  const formResponse="https://docs.google.com/forms/d/e/1FAIpQLScD02CCfPCeSPy7e7s9Xvoj94HJHn_ff2hOGbtqoq7-5Ip_Rw/formResponse";
  const responseData=new URLSearchParams({
    "entry.1956141073": data.get("name"),
    "entry.1484551682": data.get("contact"),
    "entry.87160038": data.get("guests"),
    "entry.996334260": data.get("message") || ""
  });

  submitButton.disabled=true;
  note.textContent="Sending your RSVP…";

  try {
    await fetch(formResponse,{method:"POST",mode:"no-cors",body:responseData});
    note.textContent="Thank you. Your attendance has been confirmed.";
    form.reset();
  } catch {
    note.textContent="Something went wrong. Please try again.";
  } finally {
    submitButton.disabled=false;
  }
});
