import { create } from 'zustand'

export type ParallaxSetting = 'high' | 'eco';
export type RenderQualitySetting = 'webgl' | 'static';

interface SettingsState {
  parallax: ParallaxSetting;
  renderQuality: RenderQualitySetting;
  setParallax: (value: ParallaxSetting) => void;
  setRenderQuality: (value: RenderQualitySetting) => void;
}

const LOCAL_STORAGE_PARALLAX_KEY = 'aethernote_setting_parallax';
const LOCAL_STORAGE_RENDER_KEY = 'aethernote_setting_render';

export const useSettingsStore = create<SettingsState>((set) => ({
  parallax: (localStorage.getItem(LOCAL_STORAGE_PARALLAX_KEY) as ParallaxSetting) || 'high',
  renderQuality: (localStorage.getItem(LOCAL_STORAGE_RENDER_KEY) as RenderQualitySetting) || 'webgl',
  setParallax: (parallax) => {
    localStorage.setItem(LOCAL_STORAGE_PARALLAX_KEY, parallax);
    set({ parallax });
  },
  setRenderQuality: (renderQuality) => {
    localStorage.setItem(LOCAL_STORAGE_RENDER_KEY, renderQuality);
    set({ renderQuality });
  }
}));

export default useSettingsStore;
