"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Leaf, Heart, Smile } from "lucide-react";
import Marquee from "@/components/sections/Marquee";

interface HeroProps {
  loaded?: boolean;
}

export default function Hero({ loaded = false }: HeroProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const imageWrapRef = useRef<HTMLDivElement>(null);
  const marqueeWrapRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const bottomBarRef = useRef<HTMLDivElement>(null);

  // ── Intro animation ──
  useEffect(() => {
    if (!loaded) return;

    const img = imgRef.current;
    const content = contentRef.current;
    const features = featuresRef.current;

    const introTl = gsap.timeline({ delay: 0.1 });

    if (img) {
      gsap.set(img, { scale: 1.05 });
      introTl.to(img, { scale: 1, duration: 2.5, ease: "power3.out" }, 0);
    }

    if (content) {
      const elements = content.children;
      gsap.set(elements, { autoAlpha: 0, y: 60 });
      introTl.to(
        elements,
        {
          autoAlpha: 1,
          y: 0,
          duration: 1.2,
          stagger: 0.15,
          ease: "power3.out",
        },
        0.3
      );
    }


    if (features) {
      const items = features.querySelectorAll(".feature-item");
      gsap.set(items, { autoAlpha: 0, y: 20 });
      introTl.to(
        items,
        { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.1, ease: "power2.out" },
        1
      );
    }

    return () => {
      introTl.kill();
    };
  }, [loaded]);

  // ── Scroll-driven mask / marquee effect ──
  useEffect(() => {
    const section = sectionRef.current;
    const inner = innerRef.current;
    const imageWrap = imageWrapRef.current;
    const img = imgRef.current;
    const overlay = overlayRef.current;
    const marqueeWrap = marqueeWrapRef.current;

    if (!section || !inner || !imageWrap || !img || !marqueeWrap) return;

    const triggers: ScrollTrigger[] = [];
    const mm = gsap.matchMedia();

    mm.add("(min-width: 900px)", () => {
      const scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: inner,
          start: "top top",
          end: "+=120%",
          pin: inner,
          pinSpacing: true,
          scrub: 0.6,
          invalidateOnRefresh: true,
        },
      });
      if (scrollTl.scrollTrigger) triggers.push(scrollTl.scrollTrigger);

      scrollTl.fromTo(img, { scale: 1 }, { scale: 1.25, ease: "none" }, 0);
      scrollTl.fromTo(
        imageWrap,
        { clipPath: "inset(0% 0% 0% 0% round 0px)" },
        { clipPath: "inset(12% 27.5% 12% 27.5% round 24px)", ease: "none" },
        0
      );
      if (overlay) {
        scrollTl.fromTo(overlay, { opacity: 0.45 }, { opacity: 0, ease: "none" }, 0);
      }

      // Fade out text content with upward slide
      const content = contentRef.current;
      if (content) {
        scrollTl.fromTo(content.children, { autoAlpha: 1, y: 0 }, { autoAlpha: 0, y: -100, stagger: 0.05, ease: "power2.inOut" }, 0);
      }
      // Fade out bottom features bar
      const bottomBar = bottomBarRef.current;
      if (bottomBar) {
        scrollTl.fromTo(bottomBar, { autoAlpha: 1, y: 0 }, { autoAlpha: 0, y: -40, ease: "power1.in" }, 0);
      }

      // Marquee slides up from below
      scrollTl.fromTo(marqueeWrap, { yPercent: 100 }, { yPercent: 0, ease: "none" }, 0);

      return () => {
        scrollTl.kill();
        if (scrollTl.scrollTrigger) scrollTl.scrollTrigger.kill();
      };
    });

    mm.add("(max-width: 899px)", () => {
      const mobileTl = gsap.timeline({
        scrollTrigger: {
          trigger: inner,
          start: "top top",
          end: "+=100%",
          pin: inner,
          pinSpacing: true,
          scrub: 0.55,
          invalidateOnRefresh: true,
        },
      });
      if (mobileTl.scrollTrigger) triggers.push(mobileTl.scrollTrigger);

      mobileTl.fromTo(img, { scale: 1 }, { scale: 1.1, ease: "none" }, 0);
      mobileTl.fromTo(
        imageWrap,
        { clipPath: "inset(0% 0% 0% 0% round 0px)" },
        { clipPath: "inset(10% 8% 18% 8% round 22px)", ease: "none" },
        0
      );
      if (overlay) {
        mobileTl.fromTo(overlay, { opacity: 0.45 }, { opacity: 0.08, ease: "none" }, 0);
      }

      // Fade out text content with upward slide
      const contentMob = contentRef.current;
      if (contentMob) {
        mobileTl.fromTo(contentMob.children, { autoAlpha: 1, y: 0 }, { autoAlpha: 0, y: -80, stagger: 0.05, ease: "power2.inOut" }, 0);
      }
      // Fade out bottom features bar
      const bottomBarMob = bottomBarRef.current;
      if (bottomBarMob) {
        mobileTl.fromTo(bottomBarMob, { autoAlpha: 1, y: 0 }, { autoAlpha: 0, y: -30, ease: "power1.in" }, 0);
      }

      mobileTl.fromTo(marqueeWrap, { yPercent: 100 }, { yPercent: 0, ease: "none" }, 0);

      return () => {
        mobileTl.kill();
        if (mobileTl.scrollTrigger) mobileTl.scrollTrigger.kill();
      };
    });

    return () => {
      mm.revert();
      triggers.forEach((st) => st.kill());
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative bg-[#F5E6D3]"
    >
      <div ref={innerRef} className="relative h-screen w-full overflow-hidden bg-[#F5E6D3]">
        {/* Marquee background (moves up during scroll) */}
        <div ref={marqueeWrapRef} className="absolute inset-0 z-0 will-change-transform">
          <Marquee variant="background" />
        </div>

        {/* Image with clip-path mask */}
        <div
          ref={imageWrapRef}
          className="absolute inset-0 z-10 will-change-[clip-path]"
          style={{ clipPath: "inset(0% 0% 0% 0% round 0px)" }}
        >
            <img
              ref={imgRef}
              src="/images/hero.webp"
              alt="Woman enjoying ice cream"
              className="absolute inset-0 h-full w-full object-cover will-change-transform"
              style={{ transform: "scale(1)" }}
              fetchPriority="high"
            />
            <div
              ref={overlayRef}
              className="absolute inset-0 bg-gradient-to-r from-[#2A1810]/70 via-[#2A1810]/30 to-transparent"
              style={{ opacity: 0.45 }}
            />
          </div>

        {/* Content Container (sits above the image) */}
        <div className="absolute inset-0 z-20 flex flex-col justify-between pt-28 pointer-events-none [&>*]:pointer-events-auto">
          {/* Main Hero Content */}
          <div className="relative flex-grow flex items-center px-6 md:px-12 lg:px-24">
        <div className="w-full max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12 mt-8 md:mt-0">

          {/* Left Content */}
          <div ref={contentRef} className="max-w-xl text-cream">
            {/* Small Label */}
            <div className="flex items-center gap-3 mb-6">
              <span className="text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase text-cream/90">
                Scoops of Happiness
              </span>
              <div className="flex items-center text-terracotta">
                <div className="w-1.5 h-1.5 bg-terracotta rotate-45 opacity-80" />
                <div className="h-px w-8 bg-terracotta ml-2 opacity-80" />
              </div>
            </div>

            {/* Headline */}
            <h1 className="text-[3.5rem] md:text-7xl lg:text-[6rem] leading-[1.05] mb-8 font-serif">
              Made to <br />
              <span className="font-script text-[#A31D1D] lowercase text-[5rem] md:text-8xl lg:text-[8rem] leading-[0.7] inline-block -ml-2 -rotate-1 mt-1">brighten</span>
              <br />
              your day<span className="text-[#A31D1D]">.</span>
            </h1>

            {/* Paragraph */}
            <p className="text-sm md:text-base text-cream/90 max-w-md mb-10 leading-relaxed font-sans">
              From tropical mango to timeless classics, our ice creams are made with real ingredients and flavors that feel like home.
            </p>
          </div>


        </div>
      </div>

      {/* Bottom Features Bar with Wavy Torn Paper Edge */}
      <div ref={bottomBarRef} className="relative z-20 w-full">
        {/* Torn paper edge SVG */}
        <div className="absolute bottom-full left-0 w-full overflow-hidden leading-none text-[#F5E6D3] translate-y-[1px]">
          <svg className="relative block w-full h-[15px] md:h-[35px]" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,120 L0,110 L0.0,108.6 L2.7,109.0 L5.3,107.5 L8.0,102.6 L10.7,100.3 L13.3,99.8 L16.0,96.7 L18.7,89.9 L21.3,89.3 L24.0,87.3 L26.7,86.4 L29.3,85.2 L32.0,83.5 L34.7,82.8 L37.3,82.3 L40.0,78.6 L42.7,73.4 L45.3,73.7 L48.0,71.2 L50.7,67.9 L53.3,67.5 L56.0,69.1 L58.7,67.6 L61.3,67.0 L64.0,63.4 L66.7,62.2 L69.3,62.6 L72.0,60.4 L74.7,54.9 L77.3,55.4 L80.0,56.6 L82.7,54.5 L85.3,54.2 L88.0,54.6 L90.7,54.0 L93.3,54.2 L96.0,49.5 L98.7,47.4 L101.3,48.5 L104.0,46.9 L106.7,44.6 L109.3,45.1 L112.0,46.3 L114.7,47.1 L117.3,47.1 L120.0,45.4 L122.7,44.2 L125.3,45.3 L128.0,41.9 L130.7,39.2 L133.3,40.5 L136.0,41.7 L138.7,41.2 L141.3,41.5 L144.0,41.4 L146.7,42.9 L149.3,43.5 L152.0,41.2 L154.7,38.3 L157.3,40.0 L160.0,39.7 L162.7,37.3 L165.3,38.4 L168.0,41.8 L170.7,41.6 L173.3,41.9 L176.0,41.3 L178.7,40.3 L181.3,41.5 L184.0,38.7 L186.7,36.4 L189.3,38.1 L192.0,41.4 L194.7,39.4 L197.3,39.9 L200.0,41.0 L202.7,42.0 L205.3,42.4 L208.0,41.8 L210.7,37.8 L213.3,39.4 L216.0,38.9 L218.7,37.1 L221.3,38.2 L224.0,42.7 L226.7,41.6 L229.3,41.6 L232.0,42.3 L234.7,40.4 L237.3,41.3 L240.0,39.5 L242.7,36.4 L245.3,38.0 L248.0,40.7 L250.7,39.5 L253.3,39.7 L256.0,40.9 L258.7,42.1 L261.3,42.1 L264.0,40.8 L266.7,37.9 L269.3,39.3 L272.0,39.1 L274.7,37.2 L277.3,38.1 L280.0,41.4 L282.7,41.7 L285.3,41.3 L288.0,42.4 L290.7,40.5 L293.3,41.0 L296.0,39.7 L298.7,36.5 L301.3,37.9 L304.0,39.9 L306.7,39.6 L309.3,39.5 L312.0,40.9 L314.7,42.3 L317.3,41.8 L320.0,41.0 L322.7,38.1 L325.3,39.1 L328.0,40.2 L330.7,37.2 L333.3,38.0 L336.0,41.1 L338.7,41.9 L341.3,41.0 L344.0,41.1 L346.7,40.7 L349.3,40.8 L352.0,40.8 L354.7,36.6 L357.3,37.8 L360.0,42.3 L362.7,39.7 L365.3,39.4 L368.0,43.1 L370.7,42.5 L373.3,41.5 L376.0,41.6 L378.7,38.2 L381.3,39.0 L384.0,38.6 L386.7,37.4 L389.3,38.0 L392.0,42.7 L394.7,42.0 L397.3,40.8 L400.0,42.3 L402.7,40.9 L405.3,40.5 L408.0,38.3 L410.7,36.8 L413.3,37.8 L416.0,40.6 L418.7,39.8 L421.3,39.2 L424.0,42.3 L426.7,42.7 L429.3,41.2 L432.0,40.5 L434.7,38.4 L437.3,38.9 L440.0,39.4 L442.7,37.5 L445.3,37.9 L448.0,41.4 L450.7,42.2 L453.3,40.6 L456.0,42.7 L458.7,41.1 L461.3,40.3 L464.0,38.8 L466.7,37.0 L469.3,37.8 L472.0,41.1 L474.7,39.9 L477.3,39.1 L480.0,41.0 L482.7,42.9 L485.3,40.9 L488.0,41.0 L490.7,38.7 L493.3,38.8 L496.0,39.8 L498.7,37.7 L501.3,38.0 L504.0,42.4 L506.7,42.4 L509.3,40.4 L512.0,41.0 L514.7,41.4 L517.3,40.1 L520.0,39.8 L522.7,37.2 L525.3,37.8 L528.0,41.3 L530.7,40.1 L533.3,39.1 L536.0,43.6 L538.7,43.1 L541.3,40.7 L544.0,41.0 L546.7,38.9 L549.3,38.7 L552.0,38.7 L554.7,37.8 L557.3,38.0 L560.0,41.6 L562.7,42.5 L565.3,40.2 L568.0,42.1 L570.7,41.6 L573.3,39.9 L576.0,38.8 L578.7,37.4 L581.3,37.9 L584.0,42.0 L586.7,40.2 L589.3,39.1 L592.0,42.4 L594.7,43.2 L597.3,40.5 L600.0,39.0 L602.7,39.1 L605.3,38.7 L608.0,40.3 L610.7,38.0 L613.3,38.1 L616.0,41.2 L618.7,42.7 L621.3,40.2 L624.0,41.2 L626.7,41.8 L629.3,39.8 L632.0,39.1 L634.7,37.6 L637.3,38.0 L640.0,39.7 L642.7,40.4 L645.3,39.2 L648.0,43.6 L650.7,43.4 L653.3,40.4 L656.0,39.5 L658.7,39.3 L661.3,38.7 L664.0,37.5 L666.7,38.1 L669.3,38.3 L672.0,42.7 L674.7,42.8 L677.3,40.1 L680.0,39.5 L682.7,42.0 L685.3,39.7 L688.0,37.9 L690.7,37.7 L693.3,38.2 L696.0,40.6 L698.7,40.5 L701.3,39.3 L704.0,43.4 L706.7,43.5 L709.3,40.3 L712.0,38.6 L714.7,39.5 L717.3,38.8 L720.0,38.5 L722.7,38.3 L725.3,38.5 L728.0,43.1 L730.7,42.8 L733.3,40.1 L736.0,42.0 L738.7,42.1 L741.3,39.7 L744.0,38.0 L746.7,37.9 L749.3,38.4 L752.0,41.7 L754.7,40.5 L757.3,39.4 L760.0,43.0 L762.7,43.6 L765.3,40.2 L768.0,38.1 L770.7,39.6 L773.3,38.9 L776.0,39.1 L778.7,38.4 L781.3,38.8 L784.0,42.5 L786.7,42.9 L789.3,40.1 L792.0,39.6 L794.7,42.2 L797.3,39.6 L800.0,36.7 L802.7,38.0 L805.3,38.6 L808.0,40.7 L810.7,40.6 L813.3,39.6 L816.0,41.0 L818.7,43.6 L821.3,40.2 L824.0,37.5 L826.7,39.8 L829.3,39.0 L832.0,37.8 L834.7,38.5 L837.3,39.0 L840.0,40.5 L842.7,42.8 L845.3,40.2 L848.0,39.0 L850.7,42.2 L853.3,39.6 L856.0,37.9 L858.7,38.1 L861.3,38.8 L864.0,40.2 L866.7,40.6 L869.3,39.8 L872.0,41.0 L874.7,43.6 L877.3,40.2 L880.0,37.3 L882.7,39.8 L885.3,39.1 L888.0,36.5 L890.7,38.5 L893.3,39.4 L896.0,40.8 L898.7,42.8 L901.3,40.3 L904.0,39.6 L906.7,42.2 L909.3,39.7 L912.0,37.8 L914.7,38.2 L917.3,39.1 L920.0,38.9 L922.7,40.5 L925.3,40.1 L928.0,43.2 L930.7,43.5 L933.3,40.2 L936.0,37.2 L938.7,39.8 L941.3,39.3 L944.0,39.0 L946.7,38.5 L949.3,39.7 L952.0,41.0 L954.7,42.7 L957.3,40.5 L960.0,39.5 L962.7,42.1 L965.3,39.7 L968.0,37.9 L970.7,38.2 L973.3,39.4 L976.0,38.2 L978.7,40.4 L981.3,40.4 L984.0,43.0 L986.7,43.3 L989.3,40.3 L992.0,36.5 L994.7,39.8 L997.3,39.4 L1000.0,37.7 L1002.7,38.5 L1005.3,40.1 L1008.0,42.8 L1010.7,42.5 L1013.3,40.6 L1016.0,40.9 L1018.7,42.0 L1021.3,39.8 L1024.0,36.7 L1026.7,38.2 L1029.3,39.7 L1032.0,39.5 L1034.7,40.5 L1037.3,40.9 L1040.0,42.8 L1042.7,43.5 L1045.3,40.8 L1048.0,37.4 L1050.7,40.6 L1053.3,40.6 L1056.0,39.6 L1058.7,39.9 L1061.3,42.2 L1064.0,42.2 L1066.7,44.7 L1069.3,43.5 L1072.0,42.9 L1074.7,45.4 L1077.3,43.8 L1080.0,41.7 L1082.7,43.2 L1085.3,45.5 L1088.0,46.0 L1090.7,46.9 L1093.3,48.4 L1096.0,50.2 L1098.7,51.7 L1101.3,49.9 L1104.0,47.8 L1106.7,50.9 L1109.3,51.8 L1112.0,49.8 L1114.7,52.4 L1117.3,55.8 L1120.0,56.7 L1122.7,59.3 L1125.3,59.3 L1128.0,58.6 L1130.7,62.4 L1133.3,61.8 L1136.0,58.7 L1138.7,62.8 L1141.3,66.3 L1144.0,68.0 L1146.7,69.1 L1149.3,71.9 L1152.0,72.8 L1154.7,76.5 L1157.3,75.9 L1160.0,73.8 L1162.7,78.7 L1165.3,80.8 L1168.0,79.3 L1170.7,83.1 L1173.3,87.9 L1176.0,91.2 L1178.7,92.9 L1181.3,94.3 L1184.0,94.5 L1186.7,99.2 L1189.3,99.9 L1192.0,98.8 L1194.7,103.0 L1197.3,107.9 L1200.0,109.5 L1200,120 Z" fill="currentColor"></path>
          </svg>
        </div>

        {/* Features Content */}
        <div className="bg-[#F5E6D3] pt-0 pb-4 px-6 md:px-12 lg:px-24">
          <div ref={featuresRef} className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 divide-y md:divide-y-0 md:divide-x divide-terracotta/20">

            {/* Feature 1 */}
            <div className="feature-item flex items-start gap-2.5 pt-3 md:pt-0 lg:pl-4 first:pl-0">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-terracotta/10 text-terracotta flex items-center justify-center">
                <Leaf size={20} strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="text-[10px] md:text-xs font-bold tracking-widest text-espresso mb-1">REAL INGREDIENTS</h3>
                <p className="text-xs md:text-sm text-espresso/70 leading-relaxed">Made with natural<br />ingredients you can trust.</p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="feature-item flex items-start gap-2.5 pt-3 md:pt-0 lg:pl-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-terracotta/10 text-terracotta flex items-center justify-center">
                <Heart size={20} strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="text-[10px] md:text-xs font-bold tracking-widest text-espresso mb-1">MADE WITH LOVE</h3>
                <p className="text-xs md:text-sm text-espresso/70 leading-relaxed">Crafted in small batches<br />with care.</p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="feature-item flex items-start gap-2.5 pt-3 md:pt-0 lg:pl-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-terracotta/10 text-terracotta flex items-center justify-center">
                {/* Custom Ice Cream icon */}
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 11a5 5 0 0 1 10 0"></path>
                  <path d="M12 22L7 11h10l-5 11z"></path>
                  <path d="M12 2a3 3 0 0 0-3 3"></path>
                </svg>
              </div>
              <div>
                <h3 className="text-[10px] md:text-xs font-bold tracking-widest text-espresso mb-1">FLAVORS FOR ALL</h3>
                <p className="text-xs md:text-sm text-espresso/70 leading-relaxed">From timeless classics to<br />exciting new favorites.</p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="feature-item flex items-start gap-2.5 pt-3 md:pt-0 lg:pl-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-terracotta/10 text-terracotta flex items-center justify-center">
                <Smile size={20} strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="text-[10px] md:text-xs font-bold tracking-widest text-espresso mb-1">HAPPINESS GUARANTEED</h3>
                <p className="text-xs md:text-sm text-espresso/70 leading-relaxed">Because every bite should<br />bring a smile.</p>
              </div>
            </div>

          </div>
        </div>
      </div>
        </div>{/* end Content Container */}
      </div>{/* end inner */}
    </section>
  );
}
