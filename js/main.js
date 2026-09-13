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

/* RSVP — temporary email version; we'll replace this with Google Sheets/Formspree later */
document.getElementById("rsvpForm").addEventListener("submit",e=>{
  e.preventDefault();
  const data=new FormData(e.currentTarget);
  const note=document.getElementById("formNote");
  const email="YOUR_EMAIL@example.com";
  const subject=encodeURIComponent("Yuwei Bridal Atelier Grand Opening RSVP");
  const body=encodeURIComponent(
    `Name: ${data.get("name")}\nContact: ${data.get("contact")}\nGuests: ${data.get("guests")}\nMessage: ${data.get("message")}`
  );
  note.textContent="Opening your email app…";
  window.location.href=`mailto:${email}?subject=${subject}&body=${body}`;
});
