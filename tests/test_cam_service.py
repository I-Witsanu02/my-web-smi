"""Synthetic numerical tests only; not medical/clinical evidence."""
import unittest
from unittest.mock import patch
import torch
from torch import nn
import numpy as np
from cam_service import compute_cam,METHODS,spatial

class Toy(nn.Module):
    def __init__(self):
        super().__init__();self.layer=nn.Conv2d(3,2,1,bias=False)
        with torch.no_grad():self.layer.weight.fill_(.2)
    def forward(self,x,gender):
        a=self.layer(x.flatten(0,1)).reshape(x.shape[0],9,2,*x.shape[-2:])
        return {'pred_months':a.square().mean((1,2,3,4))+gender*.01}

class CamTests(unittest.TestCase):
    def test_all_methods_finite_and_cleanup(self):
        torch.manual_seed(4);m=Toy().eval();x=torch.rand(1,9,3,4,4)
        for method in METHODS:
            with self.subTest(method=method),patch('cam_service.target_module',return_value=('layer',m.layer)):
                output,maps,meta=compute_cam(m,x,torch.zeros(1),method,2)
                self.assertEqual(maps.shape,(9,4,4));self.assertTrue(np.isfinite(maps).all())
                self.assertEqual(meta['method'],method);self.assertFalse(meta['faithfulness_validated'])
                self.assertEqual(len(m.layer._forward_hooks),0)
                self.assertTrue(torch.allclose(output['pred_months'],m(x,torch.zeros(1))['pred_months']))
    def test_gradcampp_denominator(self):
        torch.manual_seed(7);m=Toy().eval();x=torch.rand(1,9,3,4,4);captured={}
        h=m.layer.register_forward_hook(lambda _m,_i,o:captured.update(a=o))
        output=m(x,torch.zeros(1));a=captured['a'];g=torch.autograd.grad(output['pred_months'].sum(),a)[0];h.remove()
        alpha=g.square()/(2*g.square()+a.sum((2,3),keepdim=True)*g.pow(3)+1e-6)
        expected=((alpha*g.relu()).sum((2,3),keepdim=True)*a).sum(1).relu().detach().numpy()
        with patch('cam_service.target_module',return_value=('layer',m.layer)):
            _,actual,_=compute_cam(m,x,torch.zeros(1),'GradCAM++')
        np.testing.assert_allclose(actual,expected,rtol=1e-5,atol=1e-6)
    def test_spatial_layout_and_rejection(self):
        self.assertEqual(tuple(spatial(torch.zeros(9,7,7,32)).shape),(9,32,7,7))
        with self.assertRaises(ValueError):spatial(torch.zeros(1,3,4,4))
        with self.assertRaises(ValueError):compute_cam(Toy(),torch.zeros(1,9,3,4,4),torch.zeros(1),'invented')

if __name__=='__main__':unittest.main()
