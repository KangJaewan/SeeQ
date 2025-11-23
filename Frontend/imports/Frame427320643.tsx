import img1 from "figma:asset/9fe87ef97c593ce8f6f094f5f0bc10e73f91db1b.png";

function Group31() {
  return (
    <div className="absolute contents left-[133px] top-[39.753px]">
      <div className="absolute font-['Sniglet:Regular',_sans-serif] h-[26.747px] leading-[0] left-[133px] not-italic text-[#155db0] text-[32px] text-left top-[39.753px] tracking-[0.32px] w-[100.001px]">
        <p className="adjustLetterSpacing block leading-[normal]">Mate</p>
      </div>
    </div>
  );
}

function Group427320616() {
  return (
    <div className="absolute contents left-0 top-0">
      <Group31 />
      <div
        className="absolute bg-center bg-cover bg-no-repeat left-0 size-[133px] top-0"
        data-name="로고_최종 1"
        style={{ backgroundImage: `url('${img1}')` }}
      />
    </div>
  );
}

export default function Frame427320643() {
  return (
    <div className="relative size-full">
      <Group427320616 />
    </div>
  );
}