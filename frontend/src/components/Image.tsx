import { PHOTOFINISH_API_URL } from "@/config";

function getSizes({
    height,
    width,
    url,
    format,
    preSizes,
    quality = 50,
  }: {
    height: number;
    width: number;
    url: string;
    format: string;
    preSizes?: string;
    quality?: number;
  }): { sizes: string; srcset: string; src: string } {
    const hwRatio = width && height ? height / width : 0;
    const variants = [];
  
    const sizes = [
      48, 64, 96, 128, 256, 320, 384, 512, 640, 768, 1024, 1280, 1440, 1920, 2048,
      3840, 4096, 7680,
    ];
  
    for (const key in sizes) {
      if (height < sizes[key]) {
        continue;
      }
      const screenMaxWidth = sizes[key];
      const size = sizes[key] + "px";
  
      const _cWidth = parseInt(size);
      if (!screenMaxWidth || !_cWidth) {
        continue;
      }
  
      const _cHeight = hwRatio ? Math.round(_cWidth * hwRatio) : height;
      variants.push({
        width: _cWidth,
        size,
        screenMaxWidth,
        media: `(max-width: ${screenMaxWidth}px)`,
        src: `${PHOTOFINISH_API_URL}/_ipx/q_${quality},f_${format},s_${_cWidth}x${_cHeight}${url}`,
      });
    }
  
    variants.sort((v1, v2) => v1.screenMaxWidth - v2.screenMaxWidth);
  
    const defaultVar = variants[variants.length - 1];
    if (defaultVar) {
      defaultVar.media = "";
    }
  
    return {
      sizes: variants
        .map(
          (v) => `${v.media ? v.media + " " : ""}${preSizes ? preSizes : v.size}`
        )
        .join(", "),
      srcset: variants.map((v) => `${v.src} ${v.width}w`).join(", "),
      src: defaultVar?.src,
    };
  }
  export default function Image({
    width,
    height,
    src,
    alt,
    className = "",
    imgClassName,
    style,
    lazy,
    sizes,
    dataSrc,
    quality,
  }: {
    width: number;
    height: number;
    src: string;
    alt?: string;
    className?: string;
    imgClassName?: string;
    style?: React.CSSProperties;
    lazy?: boolean;
    sizes?: string;
    dataSrc?: string;
    quality?: number;
  }) {
    const calcSizesWebp = getSizes({
      width,
      height,
      url: src,
      format: "webp",
      preSizes: sizes,
      quality,
    });
    const calcSizesJpg = getSizes({
      width,
      height,
      url: src,
      format: "jpg",
      preSizes: sizes,
      quality,
    });
    const calcSizesJpgFull = getSizes({
      width,
      height,
      url: src,
      format: "jpg",
      quality,
    });
    return (
      <picture
        className={className}
        data-src={dataSrc}
        data-srcset={calcSizesJpgFull.srcset}
        data-sizes={calcSizesJpgFull.sizes}
      >
        <source
          type={"image/webp"}
          srcSet={calcSizesWebp.srcset}
          sizes={calcSizesWebp.sizes}
        />
        <source
          type={"image/jpg"}
          srcSet={calcSizesJpg.srcset}
          sizes={calcSizesWebp.sizes}
        />
        <img
          src={calcSizesWebp.src}
          srcSet={calcSizesWebp.srcset}
          sizes={calcSizesWebp.sizes}
          alt={alt}
          width={width}
          height={height}
          style={style}
          className={imgClassName}
          loading={lazy || lazy === undefined ? "lazy" : "eager"}
        />
      </picture>
    );
  }