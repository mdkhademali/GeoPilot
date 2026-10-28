import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CoordinateTool } from '@/features/coordinates/CoordinateTool';
import { IndexLab } from '@/features/spectral-indices/IndexLab';
import { GeoJsonTool } from '@/features/geojson/GeoJsonTool';
import { ResourcesView } from '@/features/resources/ResourcesView';
import { DataProvider } from '@/storage/DataContext';

describe('components', () => {
  it('coordinate tool converts and shows errors', () => {
    render(<CoordinateTool />);
    fireEvent.change(screen.getByLabelText(/Latitude/), { target: { value: '23.8103' } });
    fireEvent.change(screen.getByLabelText(/Longitude/), { target: { value: '90.4125' } });
    expect(screen.getByText(/46N/)).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/Latitude/), { target: { value: '120' } });
    expect(screen.getByRole('alert')).toHaveTextContent(/between -90 and 90/);
  });
  it('index lab handles zero denominator', () => {
    render(<IndexLab />);
    fireEvent.change(screen.getByLabelText(/NIR/), { target: { value: '0' } });
    fireEvent.change(screen.getByLabelText(/RED/), { target: { value: '0' } });
    expect(screen.getByRole('alert')).toHaveTextContent(/denominator is zero/);
    fireEvent.change(screen.getByLabelText(/NIR/), { target: { value: '0.5' } });
    fireEvent.change(screen.getByLabelText(/RED/), { target: { value: '0.1' } });
    expect(screen.getByText('0.666667')).toBeInTheDocument();
  });
  it('geojson tool reports invalid input', () => {
    render(<GeoJsonTool />);
    fireEvent.change(screen.getByLabelText('GeoJSON input'), { target: { value: '{bad' } });
    expect(screen.getByText(/problem\(s\) found/)).toBeInTheDocument();
  });
  it('resource hub filters by search and toggles favorites', async () => {
    render(
      <DataProvider>
        <ResourcesView />
      </DataProvider>,
    );
    fireEvent.change(screen.getByLabelText('Search'), { target: { value: 'postgis' } });
    await waitFor(() => expect(screen.queryByText('GDAL')).not.toBeInTheDocument());
    expect(screen.getByText('PostGIS')).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText(/Add PostGIS to favorites/));
    await waitFor(() => expect(screen.getByLabelText(/Remove PostGIS from favorites/)).toBeInTheDocument());
  });
});
