// TODO: refactor all file icon logic into separate component 

/**
 * The keys in this map refer to react-file-icon
 * glyph icon types. The associated value is an
 * object containing the associated extensions for
 * that key, and the style props.
 */
const FileExtToIconMap = Object.freeze({
  _3d: {
    ext: ['3dm','3ds','blend','dae','dwg','dxf','fbx','glb','gltf','iges','igs','obj','step','stl','stp'],
    props: {
      color           : undefined,
      fold            : undefined,
      foldColor       : undefined,
      glyphColor      : undefined,
      gradientColor   : undefined,
      gradientOpacity : undefined,
      labelColor      : undefined,
      labelTextColor  : undefined,
      labelUpperCase  : undefined,
      radius          : undefined,
      type            : '3d'
    }
  },
  acrobat: {
    ext: ['pdf','fdf','xfdf','joboptions','pdx','pfx','p12'],
    props: {
      color           : undefined,
      fold            : undefined,
      foldColor       : undefined,
      glyphColor      : 'red',
      gradientColor   : undefined,
      gradientOpacity : undefined,
      labelColor      : undefined,
      labelTextColor  : undefined,
      labelUpperCase  : undefined,
      radius          : undefined,
      type            : 'acrobat'
    }
  },
  android: {
    ext: ['aab','apk','dex','obb'],
    props: {
      color           : undefined,
      fold            : undefined,
      foldColor       : undefined,
      glyphColor      : undefined,
      gradientColor   : undefined,
      gradientOpacity : undefined,
      labelColor      : undefined,
      labelTextColor  : undefined,
      labelUpperCase  : undefined,
      radius          : undefined,
      type            : 'android'
    }
  },
  audio: {
    ext: ['aac','aif','aiff','flac','m4a','mid','mp3','ogg','wav'],
    props: {
      color           : undefined,
      fold            : undefined,
      foldColor       : undefined,
      glyphColor      : undefined,
      gradientColor   : undefined,
      gradientOpacity : undefined,
      labelColor      : undefined,
      labelTextColor  : undefined,
      labelUpperCase  : undefined,
      radius          : undefined,
      type            : 'audio'
    }
  },
  binary: {
    ext: ['','app','bat','bin','dll','exe','lua','iso','ps1','sh','sys','vbs'],
    props: {
      color           : undefined,
      fold            : undefined,
      foldColor       : undefined,
      glyphColor      : undefined,
      gradientColor   : undefined,
      gradientOpacity : undefined,
      labelColor      : undefined,
      labelTextColor  : undefined,
      labelUpperCase  : undefined,
      radius          : undefined,
      type            : 'binary'
    }
  },
  code: {
    ext: ['c','cpp','cs','css','go','java','js','jsx','h','hpp','htm','html','php','r','rs','ts','tsx','vb','vue','py'],
    props: {
      color           : undefined,
      fold            : undefined,
      foldColor       : undefined,
      glyphColor      : undefined,
      gradientColor   : undefined,
      gradientOpacity : undefined,
      labelColor      : undefined,
      labelTextColor  : undefined,
      labelUpperCase  : undefined,
      radius          : undefined,
      type            : 'code'
    }
  },
  compressed: {
    ext: ['7z','bz2','gz','rar','tar','zip','zipx','sitx'],
    props: {
      color           : undefined,
      fold            : undefined,
      foldColor       : undefined,
      glyphColor      : undefined,
      gradientColor   : undefined,
      gradientOpacity : undefined,
      labelColor      : undefined,
      labelTextColor  : undefined,
      labelUpperCase  : undefined,
      radius          : undefined,
      type            : 'compressed'
    }
  },
  document: {
    ext: ['doc','docx','md','odt','rtf','txt','wps'],
    props: {
      color           : undefined,
      fold            : undefined,
      foldColor       : undefined,
      glyphColor      : undefined,
      gradientColor   : undefined,
      gradientOpacity : undefined,
      labelColor      : undefined,
      labelTextColor  : undefined,
      labelUpperCase  : undefined,
      radius          : undefined,
      type            : 'document'
    }
  },
  drive: {
    ext: ['dmg','pkg'],
    props: {
      color           : undefined,
      fold            : undefined,
      foldColor       : undefined,
      glyphColor      : undefined,
      gradientColor   : undefined,
      gradientOpacity : undefined,
      labelColor      : undefined,
      labelTextColor  : undefined,
      labelUpperCase  : undefined,
      radius          : undefined,
      type            : 'drive'
    }
  },
  font: {
    ext: ['eot','fnt','otf','ttf','woff','woff2'],
    props: {
      color           : undefined,
      fold            : undefined,
      foldColor       : undefined,
      glyphColor      : undefined,
      gradientColor   : undefined,
      gradientOpacity : undefined,
      labelColor      : undefined,
      labelTextColor  : undefined,
      labelUpperCase  : undefined,
      radius          : undefined,
      type            : 'font'
    }
  },
  image: {
    ext: ['bmp','gif','ico','jpg','jpeg','png','tif','tiff'],
    props: {
      color           : undefined,
      fold            : undefined,
      foldColor       : undefined,
      glyphColor      : undefined,
      gradientColor   : undefined,
      gradientOpacity : undefined,
      labelColor      : undefined,
      labelTextColor  : undefined,
      labelUpperCase  : undefined,
      radius          : undefined,
      type            : 'image'
    }
  },
  presentation: {
    ext: ['key','ppt','pptx','odp'],
    props: {
      color           : undefined,
      fold            : undefined,
      foldColor       : undefined,
      glyphColor      : undefined,
      gradientColor   : undefined,
      gradientOpacity : undefined,
      labelColor      : undefined,
      labelTextColor  : undefined,
      labelUpperCase  : undefined,
      radius          : undefined,
      type            : 'presentation'
    }
  },
  settings: {
    ext: ['cfg','env','json','ini','log','plist','toml','xml','yaml','yml'],
    props: {
      color           : undefined,
      fold            : undefined,
      foldColor       : undefined,
      glyphColor      : undefined,
      gradientColor   : undefined,
      gradientOpacity : undefined,
      labelColor      : undefined,
      labelTextColor  : undefined,
      labelUpperCase  : undefined,
      radius          : undefined,
      type            : 'settings'
    }
  },
  spreadsheet: {
    ext: ['csv','ods','xlr','xls','xlsx'],
    props: {
      color           : undefined,
      fold            : undefined,
      foldColor       : undefined,
      glyphColor      : undefined,
      gradientColor   : undefined,
      gradientOpacity : undefined,
      labelColor      : undefined,
      labelTextColor  : undefined,
      labelUpperCase  : undefined,
      radius          : undefined,
      type            : 'spreadsheet'
    }
  },
  vector: {
    ext: ['ai','eps','svg'],
    props: {
      color           : undefined,
      fold            : undefined,
      foldColor       : undefined,
      glyphColor      : undefined,
      gradientColor   : undefined,
      gradientOpacity : undefined,
      labelColor      : undefined,
      labelTextColor  : undefined,
      labelUpperCase  : undefined,
      radius          : undefined,
      type            : 'vector'
    }
  },
  video: {
    ext: ['avi','flv','mkv','mov','mp4','mpeg','mpg','ogv','webm','wmv','swf'],
    props: {
      color           : undefined,
      fold            : undefined,
      foldColor       : undefined,
      glyphColor      : undefined,
      gradientColor   : undefined,
      gradientOpacity : undefined,
      labelColor      : undefined,
      labelTextColor  : undefined,
      labelUpperCase  : undefined,
      radius          : undefined,
      type            : 'video'
    }
  }
});

/**
 * Given file extension ext, returns the file icon to render.
 * Specifically, returns a props object with react-file-icon
 * properties. This will override any properties set by
 * {...defaultProperties[ext]}; you may also add extensions
 * that do not have defaultProperties to any ext list to use
 * the corresponding props for that extension.
 * 
 * @param {*} ext 
 * @returns
 */
const iconMap = (ext) => {
  const extension = String(ext).toLowerCase().replace('.', '').trim();
  for (const [_, val] of Object.entries(FileExtToIconMap)) {
    const extensions = val.ext;
    const props = val.props;
    if (extensions.includes(extension)) return props;
  }
  return null;
};

export default iconMap;