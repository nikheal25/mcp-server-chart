# 📋 CHART FIXES TODO

## 🚨 BROKEN CHARTS - PRIORITY LIST

### **EMPTY CHARTS (No Data Rendered)**

#### 1. dual-axes_1751161820091.svg ✅

- **Issue**: Shows "No data available"
- **Root Cause**: `dual-axes` chart type not implemented in `generateSvgContent()` switch statement
- **Fix Required**: Add dual-axes case with dual Y-axis implementation
- **Status**: 🟢 FIXED - Added `generateDualAxesChart()` function

#### 2. histogram_1751161598510.svg ✅

- **Issue**: Only shows axes, no histogram bars
- **Root Cause**: `histogram` chart type defaults to column chart but lacks binning logic
- **Fix Required**: Implement proper histogram with data binning
- **Status**: 🟢 FIXED - Added `generateHistogramChart()` with binning logic

#### 3. liquid_1751161858972.svg ❌

- **Issue**: Shows "No data available"
- **Root Cause**: `liquid` chart type not implemented
- **Fix Required**: Add liquid/gauge chart with percentage fill
- **Status**: 🔴 Not Started

#### 4. sankey_1751161622582.svg ❌

- **Issue**: Only shows axes, no flow diagram
- **Root Cause**: `sankey` chart type defaults to column chart
- **Fix Required**: Implement sankey flow paths and nodes
- **Status**: 🔴 Not Started

#### 5. treemap_1751161634389.svg ❌

- **Issue**: Only shows axes, no rectangles
- **Root Cause**: `treemap` chart type defaults to column chart
- **Fix Required**: Implement hierarchical rectangle layout
- **Status**: 🔴 Not Started

### **VISIBILITY ISSUES**

#### 6. scatter_1751161541029.svg ✅

- **Issue**: White dots on white background (invisible)
- **Root Cause**: CSS class `.chart-point { fill: #fff; }` overrides inline `fill="#4285f4"`
- **Fix Required**: Remove conflicting CSS or change dot colors
- **Status**: 🟢 FIXED - Removed `fill: #fff` from `.chart-point` CSS class

---

## 🎯 IMPLEMENTATION PHASES

### **✅ Phase 1: Quick Fixes (COMPLETE)**

- [x] **scatter** - Fix white dot visibility ✅
- [x] **dual-axes** - Add to switch statement ✅
- [x] **histogram** - Implement binning logic ✅

### **Phase 2: Medium Complexity (NEXT)**

- [ ] **liquid** - Implement gauge chart (45 min)
- [ ] **sankey** - Implement flow diagram (60 min)

### **Phase 3: Complex Charts**

- [ ] **treemap** - Implement rectangle hierarchy (60 min)

---

## 📍 CURRENT STATUS

**Total Broken Charts**: 6  
**Charts Fixed**: 3  
**Charts Remaining**: 3  
**Current Focus**: Phase 2 - liquid & sankey  
**Next Target**: Fix 2 charts at a time  

### **✅ PHASE 1 COMPLETE**

- [x] **scatter** - Fixed white dot visibility ✅
- [x] **dual-axes** - Added to switch statement ✅  
- [x] **histogram** - Implemented binning logic ✅  

---

## 🔧 TECHNICAL NOTES

**File to Modify**: `src/utils/generate.ts`
**Function**: `generateSvgContent()` switch statement
**Approach**: Add missing chart types without disrupting working charts

**Strategy**:

1. Fix one chart type at a time
2. Test after each fix
3. Don't touch working chart implementations
4. Keep changes minimal and isolated
